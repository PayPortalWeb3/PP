import { describe, it, expect, beforeEach } from 'vitest';
import { createMemoryStorage, MemoryStorage, PaymentLink, Payment } from '../lib/index.js';

describe('MemoryStorage', () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  describe('PaymentLink operations', () => {
    const createTestPaymentLink = (): PaymentLink => ({
      id: 'test123',
      targetUrl: 'https://example.com',
      price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
      recipientAddress: '0x1234',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it('should save and retrieve a payment link', async () => {
      const paymentLink = createTestPaymentLink();
      await storage.savePaymentLink(paymentLink);

      const retrieved = await storage.getPaymentLink('test123');
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('test123');
      expect(retrieved?.targetUrl).toBe('https://example.com');
    });

    it('should return null for non-existent payment link', async () => {
      const result = await storage.getPaymentLink('nonexistent');
      expect(result).toBeNull();
    });

    it('should update a payment link', async () => {
      const paymentLink = createTestPaymentLink();
      await storage.savePaymentLink(paymentLink);

      paymentLink.status = 'disabled';
      await storage.updatePaymentLink(paymentLink);

      const retrieved = await storage.getPaymentLink('test123');
      expect(retrieved?.status).toBe('disabled');
    });

    it('should throw when updating non-existent payment link', async () => {
      const paymentLink = createTestPaymentLink();
      paymentLink.id = 'nonexistent';

      await expect(storage.updatePaymentLink(paymentLink)).rejects.toThrow();
    });

    it('should delete a payment link', async () => {
      const paymentLink = createTestPaymentLink();
      await storage.savePaymentLink(paymentLink);
      
      await storage.deletePaymentLink('test123');
      
      const result = await storage.getPaymentLink('test123');
      expect(result).toBeNull();
    });
  });

  describe('Payment operations', () => {
    const createTestPayment = (): Payment => ({
      id: 'pay123',
      paymentLinkId: 'link123',
      chainId: 1,
      txHash: '0xabc123',
      fromAddress: '0xsender',
      amount: '0.001',
      confirmed: true,
      createdAt: new Date(),
      confirmedAt: new Date(),
    });

    it('should save and find payment by tx hash', async () => {
      const payment = createTestPayment();
      await storage.savePayment(payment);

      const found = await storage.getPaymentByTxHash('0xabc123');
      
      expect(found).not.toBeNull();
      expect(found?.id).toBe('pay123');
    });

    it('should find confirmed payment by payment link id', async () => {
      const payment = createTestPayment();
      await storage.savePayment(payment);

      const found = await storage.getConfirmedPayment('link123');
      
      expect(found).not.toBeNull();
      expect(found?.confirmed).toBe(true);
    });

    it('should not find unconfirmed payment', async () => {
      const payment = createTestPayment();
      payment.confirmed = false;
      await storage.savePayment(payment);

      const found = await storage.getConfirmedPayment('link123');
      expect(found).toBeNull();
    });

    it('should return null for non-existent payment', async () => {
      const byTxHash = await storage.getPaymentByTxHash('nonexistent');
      const byPaymentLinkId = await storage.getConfirmedPayment('nonexistent');
      
      expect(byTxHash).toBeNull();
      expect(byPaymentLinkId).toBeNull();
    });
  });

  describe('Utility methods', () => {
    it('should clear all data', async () => {
      await storage.savePaymentLink({
        id: 'test1',
        targetUrl: 'https://example.com',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      storage.clear();

      expect(await storage.getAllPaymentLinks()).toHaveLength(0);
      expect(await storage.getAllPayments()).toHaveLength(0);
    });

    it('should get all payment links', async () => {
      await storage.savePaymentLink({
        id: 'test1',
        targetUrl: 'https://example.com/1',
        price: { amount: '0.001', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x1234',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await storage.savePaymentLink({
        id: 'test2',
        targetUrl: 'https://example.com/2',
        price: { amount: '0.002', tokenSymbol: 'ETH', chainId: 1 },
        recipientAddress: '0x5678',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const allLinks = await storage.getAllPaymentLinks();
      expect(allLinks).toHaveLength(2);
    });
  });
});
