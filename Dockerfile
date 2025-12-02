# PayPortal Docker Image
# Build: docker build -t payportal .
# Run: docker run -p 3000:3000 -e API_KEY=your-key payportal

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist/ ./dist/
COPY bin/ ./bin/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "bin/cli.js", "--port", "3000", "--mock", "--mock-solana"]

