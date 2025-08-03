# Docker Deployment Guide

## Quick Start

### 1. Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <your-repo>
cd cron-task-manager

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- **Application**: http://localhost:8080
- **Database**: localhost:5432
- **Redis**: localhost:6379

### 2. Using Docker Build

```bash
# Build the image
docker build -t cron-manager .

# Run with database
docker run -d \
  --name cron-manager-app \
  -p 8080:5000 \
  -e DATABASE_URL="your_database_url" \
  -e API_KEY="your_api_key" \
  -e SESSION_SECRET="your_session_secret" \
  cron-manager
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Database
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://cronuser:your_secure_password@postgres:5432/cronmanager

# Security
SESSION_SECRET=your-super-secret-session-key
API_KEY=your-api-key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
APP_URL=http://localhost:8080
LOG_LEVEL=info
```

### Docker Compose Profiles

#### Full Stack (Default)
```bash
docker-compose up -d
```
Includes: App + PostgreSQL + Redis

#### With Nginx
```bash
docker-compose --profile nginx up -d
```
Includes: App + PostgreSQL + Redis + Nginx

#### Development Mode
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## Included Packages

The Docker image includes these system packages:
- **curl** - HTTP client for health checks
- **wget** - File downloader
- **ffmpeg** - Media processing
- **pwgen** - Password generator
- **dovecot-core** - Email server components
- **python3** - Python runtime for scripts
- **postgresql-client** - Database client tools
- **cron** - System cron daemon
- **supervisor** - Process manager

## Services

### Application Container
- **Port**: 5000 (internal), 8080 (external)
- **Health Check**: GET /api/stats
- **Logs**: `/app/logs` volume mounted
- **Process Manager**: Supervisor (runs app + cron)

### PostgreSQL Database
- **Port**: 5432
- **Database**: cronmanager
- **User**: cronuser
- **Data**: Persistent volume `postgres_data`

### Redis (Optional)
- **Port**: 6379
- **Data**: Persistent volume `redis_data`
- **Usage**: Caching and session storage

### Nginx (Optional)
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**: Reverse proxy, rate limiting, SSL termination
- **Configuration**: `nginx.conf`

## Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Database Operations
```bash
# Connect to database
docker-compose exec postgres psql -U cronuser -d cronmanager

# Run migrations
docker-compose exec app npm run db:push

# Database backup
docker-compose exec postgres pg_dump -U cronuser cronmanager > backup.sql
```

### Application Management
```bash
# Restart application
docker-compose restart app

# Shell access
docker-compose exec app bash

# View application logs
docker-compose exec app tail -f /app/logs/app.log
```

### System Health
```bash
# Check all services
docker-compose ps

# Health check
curl http://localhost:8080/api/stats

# System resources
docker-compose exec app top
docker-compose exec app df -h
```

## Development

### Hot Reload Development
```bash
# Mount source code for development
docker-compose -f docker-compose.dev.yml up -d

# This mounts your local code into the container
# Changes will trigger automatic restart
```

### Debugging
```bash
# Enable debug mode
docker-compose exec app npm run dev

# View detailed logs
docker-compose logs -f app | grep ERROR

# Database queries
docker-compose exec app npm run db:studio
```

## Production Deployment

### Security Checklist
- [ ] Change default passwords
- [ ] Use strong SESSION_SECRET and API_KEY
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Set up backup strategy
- [ ] Monitor resource usage
- [ ] Configure log rotation

### Performance Optimization
```bash
# Limit container resources
docker-compose up -d --scale app=2  # Multiple app instances
```

### Backup Strategy
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U cronuser cronmanager > backup_$DATE.sql
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose exec postgres pg_isready -U cronuser
   
   # Restart database
   docker-compose restart postgres
   ```

2. **Port Already in Use**
   ```bash
   # Change ports in docker-compose.yml
   ports:
     - "8081:5000"  # Change 8080 to 8081
   ```

3. **Permission Denied**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   chmod +x docker-entrypoint.sh
   ```

4. **Out of Memory**
   ```bash
   # Add memory limits in docker-compose.yml
   mem_limit: 512m
   ```

### Health Checks
```bash
# Application health
curl -f http://localhost:8080/api/stats

# Database health
docker-compose exec postgres pg_isready -U cronuser

# Redis health
docker-compose exec redis redis-cli ping
```

## Monitoring

### Log Aggregation
```bash
# Centralized logging with ELK stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Metrics Collection
```bash
# Prometheus metrics endpoint
curl http://localhost:8080/metrics
```

This Docker setup provides a complete, production-ready deployment of your Cron Task Management System with all requested system packages and comprehensive configuration options.