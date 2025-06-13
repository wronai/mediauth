# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY --from=build /app/package*.json ./
RUN npm install --only=production

# Copy built app
COPY --from=build /app/build ./build

# Install serve to run the app
RUN npm install -g serve

# Expose port (will be overridden by docker-compose)
EXPOSE 3003

# Start the app
CMD ["serve", "-s", "build", "-l", "3003"]
