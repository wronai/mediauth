# Ultimate Upload System

Complete file upload system with infrastructure separation architecture.

## 🚀 Features

- **Public File Upload** - No authentication required
- **Manager Approval Workflow** - Files require approval before download
- **Admin Configuration** - Email settings configurable by admin
- **Email Notifications** - Automatic notifications on approval/rejection
- **External Authentication** - Auth handled at infrastructure level
- **Domain Flexibility** - Easy configuration via environment variables

## 🏗️ Architecture

- **Caddy Proxy** - Handles routing, HTTPS, and authentication
- **All-in-One Backend** - Node.js service with all business logic
- **Unified Frontend** - React SPA with routing for all interfaces
- **PostgreSQL** - Database storage
- **Redis** - Session storage

## 🚀 Quick Start

### Local Development

```bash
# 1. Start the system
./scripts/start.sh

# 2. Access the applications
# Public Upload:     http://upload.localhost
# Manager Dashboard: http://manager.localhost (manager@company.com / manager123)
# Admin Panel:       http://admin.localhost (admin@company.com / admin123)
```

### VPS Deployment

```bash
# 1. Deploy to production
./scripts/deploy-vps.sh

# 2. Follow prompts to configure your domain
```

## 🔧 Configuration

### Environment Variables

```bash
# Local Development
FRONTEND_DOMAIN=upload.localhost
API_DOMAIN=api.localhost
MANAGER_DOMAIN=manager.localhost
ADMIN_DOMAIN=admin.localhost

# Production
FRONTEND_DOMAIN=upload.yourdomain.com
API_DOMAIN=api.yourdomain.com
MANAGER_DOMAIN=manager.yourdomain.com
ADMIN_DOMAIN=admin.yourdomain.com
```

### Email Configuration

1. Login to admin panel
2. Configure SMTP settings
3. Test email functionality
4. Save configuration

## 📁 Project Structure

```
ultimate-upload-system/
├── docker-compose.yml          # Infrastructure setup
├── Caddyfile                   # Reverse proxy configuration
├── .env                        # Environment variables
├── services/                   # All-in-one backend
│   ├── app.js                  # Main application
│   ├── package.json            # Dependencies
│   └── Dockerfile              # Container config
├── frontend/                   # Unified React frontend
│   ├── src/App.js              # Main application with routing
│   ├── src/App.css             # Styles
│   ├── package.json            # Dependencies
│   └── Dockerfile              # Container config
└── scripts/                    # Deployment scripts
    ├── start.sh                # Quick start
    ├── deploy-vps.sh           # VPS deployment
    └── stop.sh                 # Stop services
```

## 🔐 Authentication

- **Public Access** - Upload interface requires no authentication
- **Manager Access** - Approve/reject files (manager@company.com / manager123)
- **Admin Access** - System configuration (admin@company.com / admin123)

## 🔄 Workflow

1. **User uploads file** → Public interface
2. **File stored** → Database + file system
3. **Manager reviews** → Approval dashboard
4. **Action taken** → Approve or reject with reason
5. **Email sent** → User notified of decision
6. **File available** → Download link for approved files

## 🛠️ Development

```bash
# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Access database
docker-compose exec postgres psql -U postgres -d uploaddb

# Access Redis
docker-compose exec redis redis-cli
```

## 🌐 Production Deployment

1. Point domain DNS to your VPS
2. Run `./scripts/deploy-vps.sh`
3. Configure email settings in admin panel
4. Change default passwords

## 🔧 Troubleshooting

### Services not starting
```bash
docker-compose logs
docker-compose restart
```

### Domain not resolving (local development)
Add to `/etc/hosts`:
```
127.0.0.1 upload.localhost api.localhost manager.localhost admin.localhost
```

### Reset everything
```bash
docker-compose down -v
./scripts/start.sh
```

## 📄 License

MIT License
