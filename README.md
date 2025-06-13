# Media Upload System

A complete file upload system with separate frontend applications for different user roles, served on different subdomains.

## 🚀 Features

- **Multiple Frontend Apps** - Separate React applications for each user role
- **Role-Based Access Control** - Different interfaces for public users, managers, and admins
- **Public File Upload** - No authentication required for file uploads
- **Manager Approval Workflow** - Files require approval before being made available
- **Admin Dashboard** - User management and system configuration
- **JWT Authentication** - Secure token-based authentication

## 🏗️ Architecture

- **Frontend Applications**:
  - `login-panel` - Authentication service (http://login.localhost)
  - `public-upload` - Public file upload interface (http://upload.localhost)
  - `manager-panel` - Manager dashboard for approving/rejecting uploads (http://manager.localhost)
  - `admin-panel` - Admin interface for user management (http://admin.localhost)
- **Backend API** - Node.js/Express service (http://api.localhost)
- **Caddy Proxy** - Handles routing and reverse proxying
- **PostgreSQL** - Database storage
- **Redis** - Session storage and caching

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Docker and Docker Compose (for database and Redis)
- Caddy server (for local development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mediauth
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../admin-panel
   npm install
   
   cd ../manager-panel
   npm install
   
   cd ../public-upload
   npm install
   
   cd ../login-panel
   npm install
   cd ..
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` and update the values as needed
   - Each frontend app has its own `.env` file with the correct API URL and port

4. **Start the development environment**
   ```bash
   # Make the start script executable if needed
   chmod +x start-dev.sh
   
   # Start all services
   ./start-dev.sh
   ```

5. **Access the applications**
   - Public Upload: http://upload.localhost
   - Login: http://login.localhost
   - Manager Dashboard: http://manager.localhost
   - Admin Panel: http://admin.localhost
   - API: http://api.localhost

### Default Login Credentials

- **Admin Panel**:
  - Email: admin@example.com
  - Password: admin123

- **Manager Dashboard**:
  - Email: manager@example.com
  - Password: manager123

## 🔧 Configuration

### Environment Variables

Main `.env` file in the project root:

```bash
# Domain Configuration
UPLOAD_DOMAIN=upload.localhost
LOGIN_DOMAIN=login.localhost
MANAGER_DOMAIN=manager.localhost
ADMIN_DOMAIN=admin.localhost
API_DOMAIN=api.localhost

# Backend API
API_PORT=3005
NODE_ENV=development
JWT_SECRET=your-jwt-secret

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=devPassword
POSTGRES_DB=uploaddb
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Default Users
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
MANAGER_EMAIL=manager@example.com
MANAGER_PASSWORD=manager123
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
