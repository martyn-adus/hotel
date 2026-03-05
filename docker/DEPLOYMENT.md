# Deployment Guide

## Server Requirements

### Minimum Specs
- **CPU**: 1 core
- **RAM**: 4 GB
- **Disk**: 40 GB NVMe
- **Network**: 10 Gbit/s, 3TB traffic

### Resource Usage (estimated)
- PostgreSQL: ~512MB RAM
- Backend (NestJS): ~256-512MB RAM
- Frontend (Nginx): ~10-50MB RAM
- MinIO: ~256-512MB RAM
- Docker overhead: ~256MB RAM

## Deployment Steps

### 1. Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Upload Configuration
```bash
# Create directory
mkdir -p /opt/hotel
cd /opt/hotel

# Upload files
scp docker/docker-compose.yml user@server:/opt/hotel/
scp docker/.env user@server:/opt/hotel/
scp docker/nginx.conf user@server:/opt/hotel/
```

### 3. Configure Environment
Edit `/opt/hotel/.env`:
```bash
# Update your DockerHub username
DOCKER_USERNAME=robert0211

# Update credentials for production
JWT_SECRET="change-to-secure-random-string"
POSTGRES_PASSWORD="strong-password-here"
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD="strong-password-here"
```

### 4. Start Application
```bash
cd /opt/hotel
docker compose pull
docker compose up -d
```

### 5. Verify Deployment
```bash
# Check containers
docker compose ps

# Check logs
docker compose logs -f

# Test endpoint
curl http://localhost/api/room-types
```

## Optimization Tips

### 1. Memory Optimization
Add to `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      NODE_OPTIONS: "--max-old-space-size=512"
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### 2. PostgreSQL Tuning
Add volume with custom config:
```yaml
postgres:
  volumes:
    - ./postgres.conf:/etc/postgresql/postgresql.conf
```

`postgres.conf`:
```
shared_buffers = 512MB
effective_cache_size = 1GB
maintenance_work_mem = 128MB
max_connections = 50
```

### 3. Nginx Caching
Already configured in `nginx.conf` with:
- Gzip compression
- Static asset caching (1 year)
- Client max body size: 100MB

### 4. Log Rotation
Create `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### 5. Disk Space Monitoring
```bash
# Check disk usage
df -h

# Check Docker usage
docker system df

# Clean up unused images/containers
docker system prune -a --volumes
```

## Monitoring

### Check Resource Usage
```bash
# Container stats
docker stats

# System resources
htop
```

### Check Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
```

## Backup

### Database Backup
```bash
# Backup
docker exec hotel-postgres pg_dump -U hotel_user hotel_db > backup.sql

# Restore
cat backup.sql | docker exec -i hotel-postgres psql -U hotel_user hotel_db
```

### MinIO Backup
```bash
# Backup
docker exec hotel-minio mc mirror /data /backup

# Or use volume backup
docker run --rm -v hotel_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz /data
```

## Scaling Considerations

If traffic grows, consider:

1. **Upgrade to 2 vCPU + 8GB RAM**
2. **Separate MinIO to external S3-compatible storage** (AWS S3, DigitalOcean Spaces, etc.)
3. **Add Redis for caching**
4. **Use managed PostgreSQL** (reduces memory usage)
5. **Add CDN for static assets**
6. **Enable horizontal scaling** (multiple backend instances behind load balancer)

## Troubleshooting

### Out of Memory
```bash
# Check memory
free -h

# Restart services
docker compose restart

# Check which service uses most memory
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}"
```

### Disk Full
```bash
# Check disk
df -h

# Clean Docker
docker system prune -a

# Check MinIO usage
du -sh /var/lib/docker/volumes/docker_minio_data
```

### Container Crashes
```bash
# Check logs
docker compose logs backend --tail 100

# Restart
docker compose restart backend
```

## Security Recommendations

1. **Firewall**: Only open ports 80 and 443
2. **SSL**: Add Let's Encrypt SSL certificate
3. **Update**: Regularly update Docker images
4. **Secrets**: Use Docker secrets instead of .env for production
5. **Backup**: Automated daily backups
6. **Monitoring**: Set up monitoring (Prometheus + Grafana)

## Admin Credentials

Default admin user (created by seed):
- Email: `admin@hotel.com`
- Password: `admin123`

⚠️ **Change password after first login!**
