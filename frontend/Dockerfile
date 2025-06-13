# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy only package files first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies including devDependencies for building
RUN npm install

# Copy the rest of the files
COPY src/ ./src/
COPY public/ ./public/
COPY .env* ./

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
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]
