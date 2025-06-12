#!/bin/bash
echo "🌐 Deploying to VPS..."

read -p "Enter your domain (e.g., yourdomain.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo "❌ Domain is required"
    exit 1
fi

# Generate production .env
cat > .env << EOF
FRONTEND_DOMAIN=upload.$DOMAIN
API_DOMAIN=api.$DOMAIN
MANAGER_DOMAIN=manager.$DOMAIN
ADMIN_DOMAIN=admin.$DOMAIN
HTTP_PORT=80
HTTPS_PORT=443
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 16)
