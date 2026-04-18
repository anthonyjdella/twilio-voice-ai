# Stage 1: Install dependencies
FROM node:20-slim AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build the Next.js app
FROM node:20-slim AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Stage 3: Production runtime
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Custom server + voice agent (not traced by Next.js standalone)
COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/voice-agent ./voice-agent

# Full node_modules needed by server.mjs and voice-agent at runtime.
# pnpm uses symlinks, so selective copies break — copy the whole tree.
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

CMD ["node", "server.mjs"]
