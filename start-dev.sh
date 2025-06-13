#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "Starting development environment..."
echo "================================"

# Start database and redis
echo "Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Start backend API
echo "Starting backend API on port 3005..."
cd services
npm install
npm run dev &
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend apps in parallel
echo "Starting frontend applications..."

# Start admin panel
echo "Starting Admin Panel on port 3001 (http://admin.localhost)..."
cd admin-panel
npm install
npm start &
cd ..

# Start manager panel
echo "Starting Manager Panel on port 3002 (http://manager.localhost)..."
cd manager-panel
npm install
npm start &
cd ..

# Start public upload
echo "Starting Public Upload on port 3003 (http://upload.localhost)..."
cd public-upload
npm install
npm start &
cd ..

# Start login panel
echo "Starting Login Panel on port 3004 (http://login.localhost)..."
cd login-panel
npm install
npm start &
cd ..

# Start Caddy server
echo "Starting Caddy server..."
docker-compose up -d caddy

echo "================================"
echo "All services started!"
echo ""
echo "Access the applications at:"
echo "- Admin Panel: http://admin.localhost"
echo "- Manager Panel: http://manager.localhost"
echo "- Public Upload: http://upload.localhost"
echo "- Login: http://login.localhost"
echo "- API: http://api.localhost"
echo ""
echo "Default credentials:"
echo "- Admin: admin@example.com / admin123"
echo "- Manager: manager@example.com / manager123"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep the script running
wait
