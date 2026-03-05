#!/bin/bash
set -e

echo "🚀 Kaiserwald Hotel - Deployment Script"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please copy .env.example to .env and configure it:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Check if SSL certificates exist
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    echo -e "${YELLOW}⚠️  Warning: SSL certificates not found${NC}"
    echo "You can:"
    echo "  1. Generate self-signed certificate (for testing):"
    echo "     ./generate-ssl.sh"
    echo "  2. Use Let's Encrypt (for production):"
    echo "     See SSL_SETUP.md"
    echo ""
    read -p "Continue without SSL? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "📦 Pulling latest Docker images..."
docker compose pull

echo ""
echo "🛑 Stopping old containers..."
docker compose down

echo ""
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check if services are running
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Services started successfully!${NC}"
    echo ""
    echo "📊 Container Status:"
    docker compose ps
    echo ""
    echo "🌐 Application URLs:"
    echo "  - HTTP:  http://localhost"
    echo "  - HTTPS: https://localhost"
    echo "  - MinIO Console: http://localhost/minio-console"
    echo ""
    echo "👤 Admin Credentials:"
    echo "  - Email: admin@hotel.com"
    echo "  - Password: admin123"
    echo ""
    echo "📝 Useful Commands:"
    echo "  - View logs: docker compose logs -f"
    echo "  - Stop: docker compose down"
    echo "  - Restart: docker compose restart"
else
    echo -e "${RED}❌ Failed to start services${NC}"
    echo ""
    echo "Check logs with: docker compose logs"
    exit 1
fi
