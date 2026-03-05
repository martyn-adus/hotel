#!/bin/bash
set -e

echo "🔐 Generating Self-Signed SSL Certificate"
echo "=========================================="

# Create ssl directory if not exists
mkdir -p ssl

# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=UA/ST=Lviv/L=Lviv/O=Kaiserwald Hotel/CN=localhost"

# Set permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

echo ""
echo "✅ SSL certificate generated successfully!"
echo ""
echo "Files created:"
echo "  - ssl/cert.pem (certificate)"
echo "  - ssl/key.pem (private key)"
echo ""
echo "⚠️  Note: This is a self-signed certificate for testing only."
echo "For production, use Let's Encrypt or Cloudflare SSL."
echo "See SSL_SETUP.md for details."
