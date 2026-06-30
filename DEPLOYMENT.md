# Silver14 Nail - Docker Deployment Guide

## 📋 Prerequisites

- Ubuntu Server (20.04 LTS or later)
- Docker & Docker Compose installed
- Domain names configured:
  - `silver14nail.com` → Main storefront
  - `admin.silver14nail.com` → Admin panel
  - `api.silver14nail.com` → API (optional)
- SSL certificates (Let's Encrypt recommended)

---

## 🚀 Deployment Steps

### 1. Clone Repository

```bash
git clone <your-repo-url> /var/www/silver14nail
cd /var/www/silver14nail
```

### 2. Configure Environment Variables

```bash
# Copy environment templates
cp .env.example .env
cp .env.storefront.example apps/storefront/.env.local
cp .env.admin.example apps/admin/.env.local

# Edit with your production values
nano .env
nano apps/storefront/.env.local
nano apps/admin/.env.local
```

**Important variables to change:**
- `SECRET_KEY` - Generate strong secret key
- Database credentials (`MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`)
- Stripe keys (production keys)
- PayPal credentials (production)
- R2 Cloud credentials
- OnePAY credentials

### 3. Setup SSL Certificates

#### Option A: Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt update
sudo apt install certbot

# Stop nginx temporarily if running
sudo systemctl stop nginx

# Generate certificates
sudo certbot certonly --standalone -d silver14nail.com -d www.silver14nail.com -d admin.silver14nail.com -d api.silver14nail.com

# Copy certificates to docker volume
sudo mkdir -p docker/nginx/ssl
sudo cp /etc/letsencrypt/live/silver14nail.com/fullchain.pem docker/nginx/ssl/
sudo cp /etc/letsencrypt/live/silver14nail.com/privkey.pem docker/nginx/ssl/
sudo chmod 644 docker/nginx/ssl/*.pem
```

#### Option B: Self-signed (Development only)

```bash
mkdir -p docker/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/privkey.pem \
  -out docker/nginx/ssl/fullchain.pem \
  -subj "/CN=silver14nail.com"
```

### 4. Build & Start Services

```bash
# Build all services
docker-compose build

# Start all services in detached mode
docker-compose up -d

# Check logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 5. Run Database Migrations

```bash
# Wait for MySQL to be ready (check logs first)
docker-compose logs mysql

# Run migrations
docker-compose exec api node -e "require('typeorm').createConnection().then(c => c.runMigrations())"

# Or manually connect and run migrations
docker-compose exec api sh
# Then inside container:
cd /app
npm run typeorm migration:run
```

### 6. Copy Nginx Config to System (Optional)

If you want to use system nginx instead of containerized nginx:

```bash
# Stop nginx container
docker-compose stop nginx

# Copy config
sudo cp docker/nginx/nginx.conf /etc/nginx/sites-available/silver14nail.conf
sudo ln -s /etc/nginx/sites-available/silver14nail.conf /etc/nginx/sites-enabled/

# Update upstream servers in config to use localhost ports
sudo nano /etc/nginx/sites-enabled/silver14nail.conf
# Change:
#   server api:3000 → server localhost:3000
#   server storefront:4200 → server localhost:4200
#   server admin:4201 → server localhost:4201

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## 🔧 Management Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f storefront
docker-compose logs -f admin
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Stop Services

```bash
docker-compose stop
```

### Update & Redeploy

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run new migrations if any
docker-compose exec api npm run typeorm migration:run
```

### Database Backup

```bash
# Backup
docker-compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} silver14_nail_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} silver14_nail_db < backup_file.sql
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (⚠️ DELETES DATA)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

---

## 🔍 Troubleshooting

### Check Service Health

```bash
# API health
curl http://localhost:3000/api/health

# Storefront
curl http://localhost:4200

# Admin
curl http://localhost:4201
```

### Container Issues

```bash
# View container status
docker-compose ps

# Inspect container
docker inspect silver14-api

# Enter container shell
docker-compose exec api sh
docker-compose exec storefront sh
```

### Database Connection Issues

```bash
# Check MySQL logs
docker-compose logs mysql

# Connect to MySQL
docker-compose exec mysql mysql -u root -p
```

### Port Conflicts

```bash
# Check what's using ports
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3000
sudo lsof -i :3306

# Kill process if needed
sudo kill -9 <PID>
```

---

## 📊 Performance Optimization

### Enable Docker Logging Limits

Add to `docker-compose.yml` for each service:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Setup Monitoring

```bash
# Install monitoring stack (optional)
# Prometheus + Grafana can be added as additional services
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Use production API keys (Stripe, PayPal, etc.)
- [ ] Enable firewall (UFW)
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
- [ ] Setup SSL certificates (Let's Encrypt)
- [ ] Configure CORS properly in API
- [ ] Regularly update SSL certificates (Let's Encrypt auto-renewal)
- [ ] Setup automated backups
- [ ] Monitor logs for suspicious activity

---

## 📞 Support

For issues, check:
1. Container logs: `docker-compose logs`
2. Nginx error logs: `/var/log/nginx/error.log`
3. Application logs inside containers

---

## 🔄 Auto-renewal SSL (Let's Encrypt)

```bash
# Test renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron
sudo crontab -e

# Add this line:
0 0 1 * * certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/silver14nail.com/*.pem /var/www/silver14nail/docker/nginx/ssl/ && docker-compose -f /var/www/silver14nail/docker-compose.yml restart nginx"
```

---

## 🎯 Production URLs

After deployment, your services will be available at:

- **Storefront**: https://silver14nail.com
- **Admin Panel**: https://admin.silver14nail.com
- **API**: https://api.silver14nail.com (optional)
- **API Docs**: https://api.silver14nail.com/api/docs (if ENABLE_SWAGGER=true)
