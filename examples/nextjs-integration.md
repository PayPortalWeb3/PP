# Next.js Integration Example

Quick guide to integrate PayPortal with Next.js.

## 1. Install

```bash
npm install @payportal/portal
```

## 2. Create API Route

```typescript
// app/api/create-payment/route.ts
import { createServer } from '@payportal/portal';

const portal = createServer({
  chains: [{
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: process.env.ETH_RPC_URL!,
  }],
  apiKey: process.env.PAYPORTAL_API_KEY!,
});

export async function POST(request: Request) {
  const { productId, price } = await request.json();
  
  const link = await portal.createPaymentLink({
    targetUrl: `${process.env.NEXT_PUBLIC_URL}/success?product=${productId}`,
    price: { amount: price, tokenSymbol: 'ETH', chainId: 1 },
    recipientAddress: process.env.WALLET_ADDRESS!,
    description: `Purchase: ${productId}`,
  });
  
  return Response.json({ paymentUrl: link.url });
}
```

## 3. Frontend Button

```tsx
// components/BuyButton.tsx
'use client';

export function BuyButton({ productId, price }: { productId: string; price: string }) {
  const handleBuy = async () => {
    const res = await fetch('/api/create-payment', {
      method: 'POST',
      body: JSON.stringify({ productId, price }),
    });
    const { paymentUrl } = await res.json();
    window.location.href = paymentUrl;
  };
  
  return <button onClick={handleBuy}>Pay {price} ETH</button>;
}
```

## 4. Success Page

```tsx
// app/success/page.tsx
export default function SuccessPage({ searchParams }: { searchParams: { product: string } }) {
  return (
    <div>
      <h1>Payment Successful! ✅</h1>
      <p>Product: {searchParams.product}</p>
    </div>
  );
}
```

That's it! 🚀

