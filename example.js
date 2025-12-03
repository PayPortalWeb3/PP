/**
 * Example: Self-hosted Pay Portal Server
 * 
 * Each user runs this with their own RPC nodes.
 * 
 * Run: node example.js
 * 
 * Then visit:
 *   - Admin Panel: http://localhost:3001/admin
 *   - API Info: http://localhost:3001/
 */

const { createServer } = require('./dist/index.js');

// Create server with YOUR OWN configuration
const server = createServer({
  // Server settings
  port: 3001,
  baseUrl: 'http://localhost:3001', // Your domain
  apiKey: 'your-secret-api-key',      // Your API key
  
  // YOUR OWN blockchain nodes (using mock for demo)
  chains: [
    {
      chainId: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      rpcUrl: process.env.ETH_RPC_URL || 'mock',
      confirmations: 3,
    },
    {
      chainId: 137,
      name: 'Polygon',
      symbol: 'MATIC',
      rpcUrl: process.env.POLYGON_RPC_URL || 'mock',
      confirmations: 5,
    },
    {
      chainId: 101,
      name: 'Solana',
      symbol: 'SOL',
      rpcUrl: process.env.SOLANA_RPC_URL || 'mock',
      type: 'solana',
      confirmations: 1,
    },
  ],
});

// Start the server
server.start();

console.log(`
🎛️  Admin Panel: http://localhost:3001/admin
    API Key: your-secret-api-key
`);

// Create a sample link on startup
setTimeout(async () => {
  const link = await server.createPaymentLink({
    targetUrl: 'https://example.com/premium-content',
    price: {
      amount: '0.01',
      tokenSymbol: 'ETH',
      chainId: 1,
    },
    recipientAddress: '0xYourWalletAddress',
    description: 'Sample payment link',
  });
  
  console.log(`✅ Sample link created: http://localhost:3001/pay/${link.id}`);
}, 500);
