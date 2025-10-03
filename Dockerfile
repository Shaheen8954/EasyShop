# ==========================================
# STAGE 1: Dependencies
# ==========================================
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# ==========================================
# STAGE 2: Builder
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables with ARG for build-time only
ARG NODE_ENV=production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Build the Next.js application
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm run build; \
    fi

# ==========================================
# STAGE 3: Production Runtime
# ==========================================
FROM node:18-alpine AS production

WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy production dependencies from stage 1
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy next-i18next.config.js if it exists
COPY --from=builder /app/next-i18next.config.js ./ 2>/dev/null || echo "No next-i18next.config.js found, skipping..."

# Set runtime environment variables
ENV PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NODE_ENV=production

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
