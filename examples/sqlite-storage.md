# SQLite Storage Example

Production-ready persistent storage using SQLite.

## Install

```bash
npm install better-sqlite3
```

## Implementation

```typescript
// storage/sqlite.ts
import Database from 'better-sqlite3';
import type { Storage, PaymentLink, Payment, Subscription } from '@payportal/portal';

export class SQLiteStorage implements Storage {
  private db: Database.Database;

  constructor(filename: string = 'payportal.db') {
    this.db = new Database(filename);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payment_links (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        payment_link_id TEXT NOT NULL,
        tx_hash TEXT UNIQUE,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        payment_link_id TEXT NOT NULL,
        subscriber_address TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_payments_link ON payments(payment_link_id);
      CREATE INDEX IF NOT EXISTS idx_payments_tx ON payments(tx_hash);
      CREATE INDEX IF NOT EXISTS idx_subs_link ON subscriptions(payment_link_id);
    `);
  }

  async getPaymentLink(id: string): Promise<PaymentLink | null> {
    const row = this.db.prepare('SELECT data FROM payment_links WHERE id = ?').get(id);
    return row ? JSON.parse((row as any).data) : null;
  }

  async savePaymentLink(link: PaymentLink): Promise<void> {
    this.db.prepare('INSERT INTO payment_links (id, data) VALUES (?, ?)').run(link.id, JSON.stringify(link));
  }

  async updatePaymentLink(link: PaymentLink): Promise<void> {
    this.db.prepare('UPDATE payment_links SET data = ? WHERE id = ?').run(JSON.stringify(link), link.id);
  }

  async deletePaymentLink(id: string): Promise<void> {
    this.db.prepare('DELETE FROM payment_links WHERE id = ?').run(id);
  }

  async getAllPaymentLinks(): Promise<PaymentLink[]> {
    const rows = this.db.prepare('SELECT data FROM payment_links ORDER BY created_at DESC').all();
    return rows.map((row: any) => JSON.parse(row.data));
  }

  async savePayment(payment: Payment): Promise<void> {
    this.db.prepare('INSERT INTO payments (id, payment_link_id, tx_hash, data) VALUES (?, ?, ?, ?)')
      .run(payment.id, payment.paymentLinkId, payment.txHash, JSON.stringify(payment));
  }

  async getPaymentByTxHash(txHash: string): Promise<Payment | null> {
    const row = this.db.prepare('SELECT data FROM payments WHERE tx_hash = ?').get(txHash);
    return row ? JSON.parse((row as any).data) : null;
  }

  async getConfirmedPayment(paymentLinkId: string): Promise<Payment | null> {
    const rows = this.db.prepare('SELECT data FROM payments WHERE payment_link_id = ?').all(paymentLinkId);
    const payments = rows.map((row: any) => JSON.parse(row.data));
    return payments.find(p => p.confirmed) ?? null;
  }

  async getAllPayments(): Promise<Payment[]> {
    const rows = this.db.prepare('SELECT data FROM payments ORDER BY created_at DESC').all();
    return rows.map((row: any) => JSON.parse(row.data));
  }

  // Subscription methods follow same pattern...
  async saveSubscription(sub: Subscription): Promise<void> {
    this.db.prepare('INSERT INTO subscriptions (id, payment_link_id, subscriber_address, data) VALUES (?, ?, ?, ?)')
      .run(sub.id, sub.paymentLinkId, sub.subscriberAddress, JSON.stringify(sub));
  }

  async getSubscription(id: string): Promise<Subscription | null> {
    const row = this.db.prepare('SELECT data FROM subscriptions WHERE id = ?').get(id);
    return row ? JSON.parse((row as any).data) : null;
  }

  async updateSubscription(sub: Subscription): Promise<void> {
    this.db.prepare('UPDATE subscriptions SET data = ? WHERE id = ?').run(JSON.stringify(sub), sub.id);
  }

  async getSubscriptionByAddress(linkId: string, address: string): Promise<Subscription | null> {
    const row = this.db.prepare('SELECT data FROM subscriptions WHERE payment_link_id = ? AND subscriber_address = ?').get(linkId, address);
    return row ? JSON.parse((row as any).data) : null;
  }

  async getSubscriptionsByPaymentLink(linkId: string): Promise<Subscription[]> {
    const rows = this.db.prepare('SELECT data FROM subscriptions WHERE payment_link_id = ?').all(linkId);
    return rows.map((row: any) => JSON.parse(row.data));
  }

  async getSubscriptionsDue(beforeDate: Date): Promise<Subscription[]> {
    const rows = this.db.prepare('SELECT data FROM subscriptions').all();
    return rows
      .map((row: any) => JSON.parse(row.data))
      .filter(s => s.status === 'active' && new Date(s.nextPaymentDue) <= beforeDate);
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    const rows = this.db.prepare('SELECT data FROM subscriptions ORDER BY created_at DESC').all();
    return rows.map((row: any) => JSON.parse(row.data));
  }
}
```

## Usage

```typescript
import { createServer } from '@payportal/portal';
import { SQLiteStorage } from './storage/sqlite';

const server = createServer({
  chains: [/* ... */],
  apiKey: 'your-key',
});

server.setStorage(new SQLiteStorage('payments.db'));
server.start();
```

Your data now persists! 🗄️

