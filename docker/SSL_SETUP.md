# SSL Certificate Setup

## Option 1: Self-Signed Certificate (For Testing/Development)

### Generate Self-Signed Certificate
```bash
cd /opt/hotel
mkdir -p ssl

# Generate private key and certificate (valid for 365 days)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=UA/ST=State/L=City/O=Hotel/CN=localhost"

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
```

### Restart Nginx
```bash
docker compose restart nginx
```

### Access Application
- HTTP: http://localhost (redirects to HTTPS)
- HTTPS: https://localhost

⚠️ Browser will show security warning for self-signed certificate - this is normal for testing.

---

## Option 2: Let's Encrypt (For Production with Domain)

### Prerequisites
- Domain name pointing to your server IP
- Ports 80 and 443 open in firewall

### Install Certbot
```bash
sudo apt update
sudo apt install certbot -y
```

### Stop Nginx temporarily
```bash
cd /opt/hotel
docker compose stop nginx
```

### Generate Certificate
```bash
# Replace your-domain.com with your actual domain
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --agree-tos \
  --email your-email@example.com
```

### Copy Certificates
```bash
cd /opt/hotel
mkdir -p ssl

# Copy Let's Encrypt certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem

# Set permissions
sudo chown $USER:$USER ssl/*.pem
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem
```

### Update nginx.conf
```bash
# Update server_name in nginx.conf
sed -i 's/server_name _;/server_name your-domain.com www.your-domain.com;/' nginx.conf
```

### Start Nginx
```bash
docker compose up -d nginx
```

### Setup Auto-Renewal
```bash
# Create renewal script
cat > /opt/hotel/renew-cert.sh << 'EOF'
#!/bin/bash
cd /opt/hotel
docker compose stop nginx
sudo certbot renew
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
docker compose up -d nginx
EOF

chmod +x /opt/hotel/renew-cert.sh

# Add to crontab (runs every week)
(crontab -l 2>/dev/null; echo "0 3 * * 0 /opt/hotel/renew-cert.sh") | crontab -
```

---

## Option 3: Cloudflare SSL (Easiest for Production)

### Setup
1. Add domain to Cloudflare
2. Enable "Full (strict)" SSL mode in Cloudflare dashboard
3. Generate Cloudflare Origin Certificate:
   - Go to SSL/TLS → Origin Server
   - Click "Create Certificate"
   - Copy certificate and private key

### Save Certificates
```bash
cd /opt/hotel
mkdir -p ssl

# Paste Cloudflare certificate
cat > ssl/cert.pem << 'EOF'
[Paste certificate here]
EOF

# Paste private key
cat > ssl/key.pem << 'EOF'
[Paste private key here]
EOF

# Set permissions
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem
```

### Update nginx.conf
```bash
# Update server_name with your domain
sed -i 's/server_name _;/server_name your-domain.com;/' nginx.conf
```

### Restart Nginx
```bash
docker compose restart nginx
```

✅ Cloudflare will handle SSL termination and renewal automatically!

---

## Verification

### Test SSL Configuration
```bash
# Test HTTPS locally
curl -k https://localhost/api/room-types

# Test from outside (replace with your domain)
curl https://your-domain.com/api/room-types

# Check SSL certificate info
openssl s_client -connect localhost:443 -servername localhost < /dev/null
```

### Check Nginx Logs
```bash
docker compose logs nginx
```

---

## Troubleshooting

### Certificate Permission Errors
```bash
cd /opt/hotel
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem
```

### Nginx Won't Start
```bash
# Check nginx config
docker compose exec nginx nginx -t

# Check logs
docker compose logs nginx

# Verify certificates exist
ls -la ssl/
```

### Browser Security Warning
- **Self-signed certificates**: Normal, click "Advanced" → "Proceed"
- **Let's Encrypt**: Should work without warnings
- **Cloudflare**: Should work without warnings

### HTTPS Redirects Not Working
Check that both ports are exposed:
```bash
docker compose ps
# Should show 0.0.0.0:80->80/tcp and 0.0.0.0:443->443/tcp
```

---

## Security Best Practices

1. **Never commit SSL certificates to git**
   ```bash
   echo "ssl/" >> .gitignore
   ```

2. **Use strong ciphers** (already configured in nginx.conf)

3. **Enable HSTS** (add to nginx.conf):
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   ```

4. **Regular updates**
   ```bash
   docker compose pull
   docker compose up -d
   ```

5. **Monitor certificate expiration**
   ```bash
   # Check expiration date
   openssl x509 -in ssl/cert.pem -noout -dates
   ```

---

## For Development (HTTP only)

If you want to use HTTP only for local testing:

### Revert nginx.conf
```bash
cd /opt/hotel
git checkout nginx.conf
```

### Update docker-compose.yml
```yaml
nginx:
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    # Remove SSL volume mount
```

### Restart
```bash
docker compose restart nginx
```
