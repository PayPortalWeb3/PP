import type { Storage, PaymentLink, Payment, Subscription } from '../types.js';

/**
 * In-memory storage implementation for development and testing
 */
export class MemoryStorage implements Storage {
  private paymentLinks: Map<string, PaymentLink> = new Map();
  private payments = new Map<string, Payment>();
  private paymentsByTxHash = new Map<string, Payment>();
  private paymentsByPaymentLinkId = new Map<string, Payment[]>();
  private subscriptions = new Map<string, Subscription>();
  private subscriptionsByAddress = new Map<string, Subscription>();
  private subscriptionsByPaymentLink = new Map<string, Subscription[]>();

  async getPaymentLink(id: string): Promise<PaymentLink | null> {
    return this.paymentLinks.get(id) ?? null;
  }

  async savePaymentLink(paymentLink: PaymentLink): Promise<void> {
    this.paymentLinks.set(paymentLink.id, { ...paymentLink });
  }

  async updatePaymentLink(paymentLink: PaymentLink): Promise<void> {
    if (!this.paymentLinks.has(paymentLink.id)) {
      throw new Error(`Payment link ${paymentLink.id} not found`);
    }
    this.paymentLinks.set(paymentLink.id, { ...paymentLink, updatedAt: new Date() });
  }

  async deletePaymentLink(id: string): Promise<void> {
    this.paymentLinks.delete(id);
  }

  async savePayment(payment: Payment): Promise<void> {
    this.payments.set(payment.id, { ...payment });
    this.paymentsByTxHash.set(payment.txHash, payment);
    
    const existing = this.paymentsByPaymentLinkId.get(payment.paymentLinkId) ?? [];
    existing.push(payment);
    this.paymentsByPaymentLinkId.set(payment.paymentLinkId, existing);
  }

  async getPaymentByTxHash(txHash: string): Promise<Payment | null> {
    return this.paymentsByTxHash.get(txHash) ?? null;
  }

  async getConfirmedPayment(paymentLinkId: string): Promise<Payment | null> {
    const payments = this.paymentsByPaymentLinkId.get(paymentLinkId) ?? [];
    return payments.find(p => p.confirmed) ?? null;
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.paymentLinks.clear();
    this.payments.clear();
    this.paymentsByTxHash.clear();
    this.paymentsByPaymentLinkId.clear();
    this.subscriptions.clear();
    this.subscriptionsByAddress.clear();
    this.subscriptionsByPaymentLink.clear();
  }

  /**
   * Get all payment links (useful for debugging)
   */
  async getAllPaymentLinks(): Promise<PaymentLink[]> {
    return Array.from(this.paymentLinks.values());
  }

  /**
   * Get all payments (useful for debugging)
   */
  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  // Subscription methods

  async saveSubscription(subscription: Subscription): Promise<void> {
    this.subscriptions.set(subscription.id, { ...subscription });
    
    // Index by address
    const addressKey = `${subscription.paymentLinkId}:${subscription.subscriberAddress}`;
    this.subscriptionsByAddress.set(addressKey, subscription);
    
    // Index by payment link
    const linkSubs = this.subscriptionsByPaymentLink.get(subscription.paymentLinkId) ?? [];
    linkSubs.push(subscription);
    this.subscriptionsByPaymentLink.set(subscription.paymentLinkId, linkSubs);
  }

  async getSubscription(id: string): Promise<Subscription | null> {
    return this.subscriptions.get(id) ?? null;
  }

  async updateSubscription(subscription: Subscription): Promise<void> {
    if (!this.subscriptions.has(subscription.id)) {
      throw new Error(`Subscription ${subscription.id} not found`);
    }
    
    const updated = { ...subscription, updatedAt: new Date() };
    this.subscriptions.set(subscription.id, updated);
    
    // Update address index
    const addressKey = `${subscription.paymentLinkId}:${subscription.subscriberAddress}`;
    this.subscriptionsByAddress.set(addressKey, updated);
    
    // Update payment link index
    const linkSubs = this.subscriptionsByPaymentLink.get(subscription.paymentLinkId) ?? [];
    const idx = linkSubs.findIndex(s => s.id === subscription.id);
    if (idx !== -1) {
      linkSubs[idx] = updated;
    }
  }

  async getSubscriptionByAddress(
    paymentLinkId: string,
    subscriberAddress: string
  ): Promise<Subscription | null> {
    const addressKey = `${paymentLinkId}:${subscriberAddress}`;
    return this.subscriptionsByAddress.get(addressKey) ?? null;
  }

  async getSubscriptionsByPaymentLink(paymentLinkId: string): Promise<Subscription[]> {
    return this.subscriptionsByPaymentLink.get(paymentLinkId) ?? [];
  }

  async getSubscriptionsDue(beforeDate: Date): Promise<Subscription[]> {
    const result: Subscription[] = [];
    for (const sub of this.subscriptions.values()) {
      if (
        sub.status === 'active' &&
        sub.nextPaymentDue <= beforeDate
      ) {
        result.push(sub);
      }
    }
    return result;
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }
}

/**
 * Create a new in-memory storage instance
 */
export function createMemoryStorage(): MemoryStorage {
  return new MemoryStorage();
}
