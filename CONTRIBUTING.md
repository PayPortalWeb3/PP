# Contributing to PayPortal

Thanks for your interest in contributing to PayPortal! 🚀

## Quick Start

```bash
# Clone the repo
git clone https://github.com/PayPortalWeb3/PP.git
cd PP

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Run demo
npm run demo
```

## Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Code Style

- TypeScript for all source files
- Run `npm run build` to ensure it compiles
- Add tests for new features
- Update documentation as needed

## Project Structure

```
lib/
├── server.ts          # Main server class
├── types.ts           # TypeScript types
├── protocol.ts        # HTTP 402/403 protocol
├── providers/         # Blockchain verification
│   ├── evm.ts         # Ethereum, Polygon, etc.
│   ├── solana.ts      # Solana
│   └── mock.ts        # Testing
├── storage.ts         # Storage interface
├── webhook.ts         # Webhook system
├── subscription.ts    # Recurring payments
├── portal-token.ts    # $PP token integration
└── qrcode.ts          # QR code generation
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## Questions?

Open an issue or reach out on [Twitter/X](https://twitter.com/PayPortalWeb3).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

