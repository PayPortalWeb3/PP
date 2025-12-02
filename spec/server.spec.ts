import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createServer, 
  createMemoryStorage, 
  ReasonCode,
  PortalServer,
  MemoryStorage,
} from '../lib/index.js';

describe('PortalServer', () => {
  let server: PortalServer;
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = createMemoryStorage();
    
    server = createServer({
      chains: [{
        chainId: 1,
        name: 'Mock Ethereum',
        symbol: 'ETH',
        rpcUrl: 'mock',
        confirmations: 1,
      }],
      basePath: '/pay',
      paymentTimeout: 900,
    });
    server.setStorage(storage);
  });

  describe('createPaymentLink', () => {
    it('should create a payment link with required fields', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/secret',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      });

      expect(paymentLink.id).toBeDefined();
      expect(paymentLink.id.length).toBe(8);
      expect(paymentLink.targetUrl).toBe('https://example.com/secret');
      expect(paymentLink.status).toBe('active');
      expect(paymentLink.usedCount).toBe(0);
    });

    it('should create a payment link with optional fields', async () => {
      const expiresAt = new Date(Date.now() + 3600000);
      
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/docs',
        price: { amount: '0.01', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
        description: 'Premium documentation access',
        maxUses: 100,
        expiresAt,
        metadata: { tier: 'premium' },
      });

      expect(paymentLink.description).toBe('Premium documentation access');
      expect(paymentLink.maxUses).toBe(100);
      expect(paymentLink.expiresAt).toEqual(expiresAt);
      expect(paymentLink.metadata).toEqual({ tier: 'premium' });
    });
  });

  describe('handlePaymentLinkRequest', () => {
    it('should return not-found for non-existent link', async () => {
      const result = await server.handlePaymentLinkRequest('nonexistent');
      expect(result.type).toBe('not-found');
    });

    it('should return payment-required for unpaid link', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      });

      const result = await server.handlePaymentLinkRequest(paymentLink.id);
      
      expect(result.type).toBe('payment-required');
      if (result.type === 'payment-required') {
        expect(result.body.protocol).toBe('402-payportal-v1');
        expect(result.body.paymentLinkId).toBe(paymentLink.id);
        expect(result.body.payment.amount).toBe('0.001');
        expect(result.body.payment.chainId).toBe(1);
      }
    });

    it('should return redirect after confirmed payment', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/paid-content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      });

      // Confirm payment
      await server.confirmPayment(paymentLink.id, '0xabc123');

      const result = await server.handlePaymentLinkRequest(paymentLink.id);
      
      expect(result.type).toBe('redirect');
      if (result.type === 'redirect') {
        expect(result.targetUrl).toBe('https://example.com/paid-content');
      }
    });

    it('should return forbidden for disabled link', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      });

      await server.disablePaymentLink(paymentLink.id);

      const result = await server.handlePaymentLinkRequest(paymentLink.id);
      
      expect(result.type).toBe('forbidden');
      if (result.type === 'forbidden') {
        expect(result.body.reasonCode).toBe(ReasonCode.LINK_DISABLED);
      }
    });

    it('should return forbidden for expired link', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
        expiresAt: new Date(Date.now() - 1000), // Already expired
      });

      const result = await server.handlePaymentLinkRequest(paymentLink.id);
      
      expect(result.type).toBe('forbidden');
      if (result.type === 'forbidden') {
        expect(result.body.reasonCode).toBe(ReasonCode.LINK_EXPIRED);
      }
    });

    it('should return forbidden when usage limit reached', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
        maxUses: 1,
      });

      // Confirm payment and use once
      await server.confirmPayment(paymentLink.id, '0xabc123');
      await server.handlePaymentLinkRequest(paymentLink.id); // This increments usage

      const result = await server.handlePaymentLinkRequest(paymentLink.id);
      
      expect(result.type).toBe('forbidden');
      if (result.type === 'forbidden') {
        expect(result.body.reasonCode).toBe(ReasonCode.LINK_USAGE_LIMIT_REACHED);
      }
    });
  });

  describe('confirmPayment', () => {
    it('should confirm valid payment', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      });

      const result = await server.confirmPayment(paymentLink.id, '0xvalidtx');
      
      expect(result.status).toBe('confirmed');
    });

    it('should return pending for pending transaction', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      });

      // Mark transaction as pending in mock verifier before confirming
      const verifier = server.getVerifier(1);
      if (verifier && 'markPending' in verifier) {
        verifier.markPending('0xpendingtx');
      }

      const result = await server.confirmPayment(paymentLink.id, '0xpendingtx');
      
      expect(result.status).toBe('pending');
    });

    it('should return failed for failed transaction', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      });

      // Mark transaction as failed in mock verifier before confirming
      const verifier = server.getVerifier(1);
      if (verifier && 'markFailed' in verifier) {
        verifier.markFailed('0xfailedtx');
      }

      const result = await server.confirmPayment(paymentLink.id, '0xfailedtx');
      
      expect(result.status).toBe('failed');
    });

    it('should return failed for non-existent link', async () => {
      const result = await server.confirmPayment('nonexistent', '0xvalidtx');
      
      expect(result.status).toBe('failed');
      expect(result.message).toContain('not found');
    });
  });

  describe('getStatus', () => {
    it('should return unpaid for new link', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      });

      const status = await server.getStatus(paymentLink.id);
      expect(status).toBe('unpaid');
    });

    it('should return paid after payment', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      });

      await server.confirmPayment(paymentLink.id, '0xvalidtx');
      
      const status = await server.getStatus(paymentLink.id);
      expect(status).toBe('paid');
    });

    it('should return not_found for missing link', async () => {
      const status = await server.getStatus('nonexistent');
      expect(status).toBe('not_found');
    });

    it('should return forbidden for disabled link', async () => {
      const paymentLink = await server.createPaymentLink({
        targetUrl: 'https://example.com/content',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
      });

      await server.disablePaymentLink(paymentLink.id);
      
      const status = await server.getStatus(paymentLink.id);
      expect(status).toBe('forbidden');
    });
  });
});
