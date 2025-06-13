# Use a specific Node.js version that matches the project's requirements
FROM node:16.20.2-alpine3.17 AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:16.20.2-alpine3.17

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --production --legacy-peer-deps

# Copy built app
COPY --from=builder /app/build ./build

# Install serve to run the app
RUN npm install -g serve@14.2.0

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port (will be overridden by docker-compose)
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3004 || exit 1

# Start the app
CMD ["serve", "-s", "build", "-l", "3004"]
