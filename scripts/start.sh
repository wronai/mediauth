#!/bin/bash
echo "🚀 Starting Ultimate Upload System..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    cp .env.example .env
fi

# Start services
docker-compose up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 30

echo "✅ Ultimate Upload System is ready!"
echo ""
echo "📱 Access URLs:"
echo "   Public Upload:     http://upload.localhost"
echo "   Manager Dashboard: http://manager.localhost"
echo "   Admin Panel:       http://admin.localhost"
echo ""
echo "🔐 Demo Credentials:"
echo "   Admin:   admin@company.com / admin123"
echo "   Manager: manager@company.com / manager123"
echo ""
echo "📋 Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop:      docker-compose down"
