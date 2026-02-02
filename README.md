# Docker Deployment Guide

This guide explains how to deploy the AI Website Frontend using Docker and Docker Compose.

## 📋 Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Access to your server with SSH
- Domain configured (e.g., livekit-vyom.indusnettechnologies.com)

## 🏗️ Project Structure

```
ai_website_frontend/
├── Dockerfile                 # Multi-stage Docker build configuration
├── docker-compose.yml         # Docker Compose orchestration
├── .dockerignore             # Files to exclude from Docker build
├── .env.production           # Production environment variables template
└── next.config.ts            # Next.js config with standalone output
```

## 🚀 Quick Start

### 1. Configure Environment Variables

Copy the production environment template and update with your values:

```bash
cp .env.production .env
```

Edit `.env` with your production values:
```env
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit-vyom.indusnettechnologies.com
NEXT_PUBLIC_BACKEND_URL=https://api-livekit-vyom.indusnettechnologies.com
NEXT_PUBLIC_PIXABAY_API_KEY=your_actual_api_key
```

### 2. Build and Run with Docker Compose

```bash
# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f frontend
```

### 3. Verify Deployment

Check if the container is running:
```bash
docker-compose ps
```

Test the application:
```bash
curl http://localhost:3000
```

## 🔧 Docker Commands Reference

### Building

```bash
# Build the image
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build with specific tag
docker build -t ai-website-frontend:v1.0.0 .
```

### Running

```bash
# Start in detached mode
docker-compose up -d

# Start and view logs
docker-compose up

# Start specific service
docker-compose up frontend
```

### Managing Containers

```bash
# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart containers
docker-compose restart

# View running containers
docker-compose ps

# View logs
docker-compose logs -f frontend
```

### Debugging

```bash
# Execute shell in running container
docker-compose exec frontend sh

# View container resource usage
docker stats ai_website_frontend

# Inspect container
docker inspect ai_website_frontend
```

## 🌐 Production Deployment

### Option 1: Using Docker Compose (Recommended)

1. **Transfer files to server:**
```bash
# From your local machine
scp -r . user@your-server:/path/to/deployment/
```

2. **On the server:**
```bash
cd /path/to/deployment/
cp .env.production .env
# Edit .env with production values
nano .env

# Build and start
docker-compose up -d
```

### Option 2: Using Docker Registry

1. **Build and tag the image:**
```bash
docker build -t your-registry/ai-website-frontend:latest .
```

2. **Push to registry:**
```bash
docker push your-registry/ai-website-frontend:latest
```

3. **Pull and run on server:**
```bash
docker pull your-registry/ai-website-frontend:latest
docker-compose up -d
```

## 🔒 Reverse Proxy Configuration

### Using Caddy (Recommended)

Add to your `Caddyfile`:

```caddy
your-domain.com {
    reverse_proxy localhost:3000
    
    # Optional: Enable compression
    encode gzip
    
    # Optional: Add security headers
    header {
        Strict-Transport-Security "max-age=31536000;"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "no-referrer-when-downgrade"
    }
}
```

### Using Nginx

Add to your nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔍 Health Checks

The Docker Compose configuration includes a health check that pings `/api/health`. 

To create this endpoint, add `app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ status: 'ok' }, { status: 200 });
}
```

## 📊 Monitoring

### View Container Logs
```bash
# All logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100 frontend

# Logs since specific time
docker-compose logs --since 30m frontend
```

### Resource Monitoring
```bash
# Real-time stats
docker stats ai_website_frontend

# Container processes
docker-compose top
```

## 🛠️ Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs frontend

# Check if port is already in use
sudo lsof -i :3000

# Rebuild without cache
docker-compose build --no-cache
```

### Environment variables not working
```bash
# Verify env vars in container
docker-compose exec frontend env | grep NEXT_PUBLIC

# Check .env file
cat .env
```

### Image too large
```bash
# Check image size
docker images | grep ai-website-frontend

# The multi-stage build should keep it under 200MB
# If larger, check .dockerignore is working
```

## 🔄 Updates and Rollbacks

### Deploy New Version
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Rollback
```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose build
docker-compose up -d
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_LIVEKIT_URL` | LiveKit WebSocket URL | `wss://livekit-vyom.indusnettechnologies.com` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | `https://api-livekit-vyom.indusnettechnologies.com` |
| `NEXT_PUBLIC_PIXABAY_API_KEY` | Pixabay API key for images | `your_api_key_here` |
| `NODE_ENV` | Node environment | `production` |

## 🎯 Best Practices

1. **Always use `.env` file** - Never hardcode secrets in docker-compose.yml
2. **Use specific image tags** - Avoid `latest` in production
3. **Enable health checks** - Monitor container health
4. **Set resource limits** - Prevent container from consuming all resources
5. **Use volumes for logs** - Persist logs outside container
6. **Regular backups** - Backup your `.env` and configuration files
7. **Monitor logs** - Set up log aggregation (ELK, Loki, etc.)
8. **Security scanning** - Scan images for vulnerabilities

## 📚 Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose exec frontend env`
3. Check container status: `docker-compose ps`
4. Review this guide's troubleshooting section
