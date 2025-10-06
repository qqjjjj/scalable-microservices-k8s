# Multi-stage build for smaller, more secure images
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY services/task-service/package*.json ./

# Install workspace dependencies
RUN npm ci

# Copy source code and config
COPY services/task-service/src ./src
COPY services/task-service/tsconfig.json ./

# Build the TypeScript application
RUN npm run build

# Production stage - smaller final image
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S taskservice -u 1001

# Set working directory
WORKDIR /app

# Copy workspace files for production
COPY package*.json ./
COPY services/task-service/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R taskservice:nodejs /app
USER taskservice

# Expose port
EXPOSE 3001

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]