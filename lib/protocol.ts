import type { 
  PaymentLink, 
  Protocol402Response, 
  Protocol403Response,
  ReasonCode,
} from './types.js';
import { REASON_MESSAGES } from './utils.js';
import { generateNonce, createSignature } from './utils.js';

export interface Protocol402Options {
  basePath: string;
  timeoutSeconds: number;
  signatureSecret?: string;
  /** Base URL for callbacks (e.g., https://sn1ffprotocol.com) */
  baseUrl?: string;
}

/**
 * Build a 402 Payment Required response body
 */
export function build402Response(
  paymentLink: PaymentLink,
  options: Protocol402Options
): Protocol402Response {
  const nonce = generateNonce();
  const baseUrl = options.baseUrl || '';
  
  const response: Protocol402Response = {
    protocol: '402-payportal-v1',
    paymentLinkId: paymentLink.id,
    resource: {
      description: paymentLink.description,
      preview: null,
    },
    payment: {
      chainId: paymentLink.price.chainId,
      tokenSymbol: paymentLink.price.tokenSymbol,
      amount: paymentLink.price.amount,
      recipient: paymentLink.recipientAddress,
      timeoutSeconds: options.timeoutSeconds,
    },
    callbacks: {
      status: `${baseUrl}${options.basePath}/${paymentLink.id}/status`,
      confirm: `${baseUrl}${options.basePath}/${paymentLink.id}/confirm`,
    },
    nonce,
  };

  // Add signature if secret is provided
  if (options.signatureSecret) {
    const dataToSign = JSON.stringify({
      paymentLinkId: response.paymentLinkId,
      payment: response.payment,
      nonce: response.nonce,
    });
    response.signature = createSignature(dataToSign, options.signatureSecret);
  }

  return response;
}

export interface Protocol403Options {
  paymentLinkId?: string;
  details?: Record<string, unknown>;
}

/**
 * Build a 403 Forbidden response body
 */
export function build403Response(
  reasonCode: ReasonCode,
  options: Protocol403Options = {}
): Protocol403Response {
  return {
    protocol: '403-payportal-v1',
    paymentLinkId: options.paymentLinkId,
    reasonCode,
    reasonMessage: REASON_MESSAGES[reasonCode],
    details: options.details,
  };
}

/**
 * HTTP headers for 402 response
 */
export const HEADERS_402 = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-PayPortal-Protocol': '402-v1',
} as const;

/**
 * HTTP headers for 403 response
 */
export const HEADERS_403 = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-PayPortal-Protocol': '403-v1',
} as const;
