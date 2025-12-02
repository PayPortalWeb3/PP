import { describe, it, expect, beforeEach } from 'vitest';
import express, { Express } from 'express';
import { 
  createServer, 
  createMemoryStorage, 
  PortalServer,
} from '../lib/index.js';
import { createExpressMiddleware } from '../lib/express/index.js';

// Simple test helper to make requests
async function request(app: Express, method: string, path: string, body?: unknown) {
  // Create a simple mock request/response
  return new Promise<{
    status: number;
    headers: Record<string, string>;
    body: unknown;
    redirectUrl?: string;
  }>((resolve) => {
    const req = {
      method,
      url: path,
      path,
      params: {},
      query: {},
      body: body ?? {},
      headers: {},
      get: () => undefined,
    } as unknown as express.Request;

    // Extract params from path
    const match = path.match(/\/([^/]+)(?:\/([^/]+))?$/);
    if (match) {
      req.params = { id: match[1] };
      if (match[2]) {
        // This is a sub-route like /status or /confirm
      }
    }

    const responseHeaders: Record<string, string> = {};
    let responseStatus = 200;
    let responseBody: unknown = null;
    let redirectUrl: string | undefined;

    const res = {
      status: (code: number) => {
        responseStatus = code;
        return res;
      },
      set: (headers: Record<string, string>) => {
        Object.assign(responseHeaders, headers);
        return res;
      },
      json: (data: unknown) => {
        responseBody = data;
        resolve({
          status: responseStatus,
          headers: responseHeaders,
          body: responseBody,
        });
        return res;
      },
      redirect: (status: number, url: string) => {
        responseStatus = status;
        redirectUrl = url;
        resolve({
          status: responseStatus,
          headers: responseHeaders,
          body: null,
          redirectUrl,
        });
        return res;
      },
    } as unknown as express.Response;

    // Find and execute the route handler
    const router = createExpressMiddleware(server);
    
    // Manually route the request
    if (method === 'GET' && !path.includes('/status') && !path.includes('/confirm')) {
      router.stack.find((layer: { route?: { path: string; methods: { get: boolean } } }) => 
        layer.route?.path === '/:id' && layer.route?.methods?.get
      )?.route?.stack[0]?.handle(req, res, () => {});
    } else if (method === 'GET' && path.includes('/status')) {
      req.params.id = path.split('/')[1];
      router.stack.find((layer: { route?: { path: string; methods: { get: boolean } } }) => 
        layer.route?.path === '/:id/status'
      )?.route?.stack[0]?.handle(req, res, () => {});
    } else if (method === 'POST' && path.includes('/confirm')) {
      req.params.id = path.split('/')[1];
      router.stack.find((layer: { route?: { path: string; methods: { post: boolean } } }) => 
        layer.route?.path === '/:id/confirm'
      )?.route?.stack[0]?.handle(req, res, () => {});
    }
  });
}

let server: PortalServer;

describe('Express Middleware', () => {
  let app: Express;

  beforeEach(() => {
    const storage = createMemoryStorage();
    
    server = createServer({
      chains: [{
        chainId: 1,
        name: 'Mock Ethereum',
        symbol: 'ETH',
        rpcUrl: 'mock',
        confirmations: 1,
      }],
      basePath: '/pay',
    });
    server.setStorage(storage);

    app = express();
    app.use('/pay', createExpressMiddleware(server));
  });

  describe('GET /:id', () => {
    it('should return 402 for unpaid link', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234',
      });

      const res = await request(app, 'GET', `/${paymentLink.id}`);
      
      expect(res.status).toBe(402);
      expect(res.headers['X-PayPortal-Protocol']).toBe('402-v1');
      expect((res.body as { protocol: string }).protocol).toBe('402-payportal-v1');
    });

    it('should return 302 redirect after payment', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/paid',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234',
      });

      await server.confirmPayment(paymentLink.id, '0xtxhash');

      const res = await request(app, 'GET', `/${paymentLink.id}`);
      
      expect(res.status).toBe(302);
      expect(res.redirectUrl).toBe('https://example.com/paid');
    });
  });

  describe('GET /:id/status', () => {
    it('should return unpaid status', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234',
      });

      const res = await request(app, 'GET', `/${paymentLink.id}/status`);
      
      expect(res.status).toBe(200);
      expect((res.body as { status: string }).status).toBe('unpaid');
    });

    it('should return paid status after payment', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234',
      });

      await server.confirmPayment(paymentLink.id, '0xtxhash');

      const res = await request(app, 'GET', `/${paymentLink.id}/status`);
      
      expect(res.status).toBe(200);
      expect((res.body as { status: string }).status).toBe('paid');
    });
  });

  describe('POST /:id/confirm', () => {
    it('should confirm valid payment', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234',
      });

      const res = await request(app, 'POST', `/${paymentLink.id}/confirm`, {
        txHash: '0xvalidtx',
      });
      
      expect(res.status).toBe(200);
      expect((res.body as { status: string }).status).toBe('confirmed');
    });

    it('should reject missing txHash', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234',
      });

      const res = await request(app, 'POST', `/${paymentLink.id}/confirm`, {});
      
      expect(res.status).toBe(400);
    });
  });
});
