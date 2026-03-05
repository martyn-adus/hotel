# Kaiserwald Hotel - Швидкий старт 🚀

## Локальне тестування

```bash
cd docker

# 1. Налаштувати environment
cp .env.example .env

# 2. Згенерувати SSL (опціонально)
./generate-ssl.sh

# 3. Запустити
./deploy.sh
```

Відкрий: http://localhost або https://localhost

**Admin:** admin@hotel.com / admin123

---

## Production deployment

### 1. На сервері

```bash
# Встановити Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin -y

# Створити директорію
mkdir -p /opt/hotel
cd /opt/hotel
```

### 2. Завантажити файли

```bash
scp docker/* user@server:/opt/hotel/
```

### 3. Налаштувати

```bash
cd /opt/hotel

# Environment
cp .env.example .env
nano .env  # Змінити паролі!

# SSL (Let's Encrypt)
sudo certbot certonly --standalone -d your-domain.com
mkdir ssl
sudo cp /etc/letsencrypt/live/your-domain.com/*.pem ssl/
```

### 4. Запустити

```bash
./deploy.sh
```

Готово! https://your-domain.com

---

## Документація

- [README.md](./README.md) - Повна документація
- [SSL_SETUP.md](./SSL_SETUP.md) - Налаштування SSL
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Детальний deployment

## Команди

```bash
docker compose up -d      # Запустити
docker compose down       # Зупинити
docker compose logs -f    # Логи
docker compose ps         # Статус
```
