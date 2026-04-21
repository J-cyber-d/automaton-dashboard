FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json packages/server/
COPY packages/web/package.json packages/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/server/ packages/server/
COPY packages/web/ packages/web/
COPY scripts/ scripts/

# Build (static export + server)
RUN pnpm build:release

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built server with embedded frontend
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/bin ./bin
COPY --from=builder /app/packages/server/package.json ./
COPY --from=builder /app/packages/server/node_modules ./node_modules

EXPOSE 4820

# Volume for automaton data
VOLUME ["/data"]

ENV AUTOMATON_DB_PATH=/data/state.db
ENV DASHBOARD_PORT=4820

CMD ["node", "dist/index.js"]
