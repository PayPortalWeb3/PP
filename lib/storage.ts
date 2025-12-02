import type { Storage, PaymentLink, Payment, Subscription } from './types.js';

/**
 * In-memory storage implementation
 * Replace with database for production
 */
export class MemoryStorage implements Storage {
  private links = new Map<string, PaymentLink>();
  private payments = new Map<string, Payment>();
  private paymentsByTx = new Map<string, Payment>();
  private paymentsByLink = new Map<string, Payment[]>();
  private subscriptions = new Map<string, Subscription>();
  private subscriptionsByAddress = new Map<string, Subscription>();
  private subscriptionsByLink = new Map<string, Subscription[]>();

  async getPaymentLink(id: string): Promise<PaymentLink | null> {
    return this.links.get(id) ?? null;
  }

  async savePaymentLink(paymentLink: PaymentLink): Promise<void> {
    this.links.set(paymentLink.id, { ...paymentLink });
  }

  async updatePaymentLink(paymentLink: PaymentLink): Promise<void> {
    if (!this.links.has(paymentLink.id)) {
      throw new Error(`Payment link ${paymentLink.id} not found`);
    }
    this.links.set(paymentLink.id, { ...paymentLink, updatedAt: new Date() });
  }

  async deletePaymentLink(id: string): Promise<void> {
    this.links.delete(id);
  }

  async getAllPaymentLinks(): Promise<PaymentLink[]> {
    return Array.from(this.links.values());
  }

  async savePayment(payment: Payment): Promise<void> {
    this.payments.set(payment.id, { ...payment });
    this.paymentsByTx.set(payment.txHash, payment);
    
    const list = this.paymentsByLink.get(payment.paymentLinkId) ?? [];
    list.push(payment);
    this.paymentsByLink.set(payment.paymentLinkId, list);
  }

  async getPaymentByTxHash(txHash: string): Promise<Payment | null> {
    return this.paymentsByTx.get(txHash) ?? null;
  }

  async getConfirmedPayment(paymentLinkId: string): Promise<Payment | null> {
    const list = this.paymentsByLink.get(paymentLinkId) ?? [];
    return list.find(p => p.confirmed) ?? null;
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  // Subscription methods

  async saveSubscription(subscription: Subscription): Promise<void> {
    this.subscriptions.set(subscription.id, { ...subscription });
    
    // Index by address
    const addressKey = `${subscription.paymentLinkId}:${subscription.subscriberAddress}`;
    this.subscriptionsByAddress.set(addressKey, subscription);
    
    // Index by link
    const linkSubs = this.subscriptionsByLink.get(subscription.paymentLinkId) ?? [];
    linkSubs.push(subscription);
    this.subscriptionsByLink.set(subscription.paymentLinkId, linkSubs);
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
    
    // Update link index
    const linkSubs = this.subscriptionsByLink.get(subscription.paymentLinkId) ?? [];
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
    return this.subscriptionsByLink.get(paymentLinkId) ?? [];
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

  /** Clear all data */
  clear(): void {
    this.links.clear();
    this.payments.clear();
    this.paymentsByTx.clear();
    this.paymentsByLink.clear();
    this.subscriptions.clear();
    this.subscriptionsByAddress.clear();
    this.subscriptionsByLink.clear();
  }
}
