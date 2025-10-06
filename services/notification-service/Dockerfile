# Multi-stage build for smaller, more secure images
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY services/notification-service/package*.json ./

# Install workspace dependencies
RUN npm ci

# Copy source code and config
COPY services/notification-service/src ./src
COPY services/notification-service/tsconfig.json ./

# Build the TypeScript application
RUN npm run build

# Production stage - smaller final image
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S notificationservice -u 1001

# Set working directory
WORKDIR /app

# Copy workspace files for production
COPY package*.json ./
COPY services/notification-service/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R notificationservice:nodejs /app
USER notificationservice

# Expose port
EXPOSE 3002

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]