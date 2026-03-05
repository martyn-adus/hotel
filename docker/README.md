# Hotel Management System - Docker Deployment

## Prerequisites
- Docker and Docker Compose installed
- DockerHub account

## Setup Instructions

### 1. Build and Push Images to DockerHub

#### Backend:
```bash
cd backend
docker build -t yourdockerhubuser/hotel-backend:latest .
docker push yourdockerhubuser/hotel-backend:latest
```

#### Frontend:
```bash
cd frontend
docker build -t yourdockerhubuser/hotel-frontend:latest .
docker push yourdockerhubuser/hotel-frontend:latest
```

### 2. Configure Environment Variables

Edit `docker/.env` file:
- Change `DOCKER_USERNAME=yourdockerhubuser` to your actual DockerHub username
- Update `JWT_SECRET` to a secure random string
- Update database credentials if needed
- Update MinIO credentials for production

### 3. Deploy on Host

Copy to your host server:
```bash
scp docker/docker-compose.yml your-server:/opt/hotel/
scp docker/.env your-server:/opt/hotel/
scp docker/nginx.conf your-server:/opt/hotel/
```

On the server:
```bash
cd /opt/hotel
docker-compose pull
docker-compose up -d
```

### 4. Access Application

- **Frontend**: http://your-server-ip
- **Backend API**: http://your-server-ip/api
- **MinIO Console**: http://your-server-ip/minio-console

## Architecture

- **Nginx**: Reverse proxy on port 80
  - `/` → Frontend (Angular SPA)
  - `/api` → Backend (NestJS API)
  - `/minio-console/` → MinIO Admin Console

- **Backend**: NestJS API on port 3000 (internal)
- **Frontend**: Angular app served by Nginx on port 80 (internal)
- **PostgreSQL**: Database on port 5432 (internal)
- **MinIO**: Object storage on ports 9000/9001 (internal)

All services communicate through `hotel-network` bridge network.

## Management Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Update images
docker-compose pull
docker-compose up -d

# Backup database
docker exec hotel-postgres pg_dump -U hotel_user hotel_db > backup.sql
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DOCKER_USERNAME | Your DockerHub username | yourdockerhubuser |
| NGINX_PORT | External port for Nginx | 80 |
| POSTGRES_DB | Database name | hotel_db |
| POSTGRES_USER | Database user | hotel_user |
| POSTGRES_PASSWORD | Database password | hotel_pass |
| JWT_SECRET | JWT secret key | change-this |
| MINIO_ROOT_USER | MinIO admin username | minioadmin |
| MINIO_ROOT_PASSWORD | MinIO admin password | minioadmin |
