# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean npm cache and install all dependencies
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY --from=build /app/package*.json ./
# Install production dependencies with legacy peer deps
RUN npm cache clean --force && \
    npm install --production --legacy-peer-deps

# Copy built app and node_modules
COPY --from=build /app/build ./build

# Install serve to run the app
RUN npm install -g serve

# Expose port (will be overridden by docker-compose)
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3005 || exit 1

# Start the app
CMD ["serve", "-s", "build", "-l", "3005"]
