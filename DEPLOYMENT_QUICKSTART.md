# Quick Deployment to Galactica NAS

This is a simplified guide for deploying Muditor to the `galactica` Synology NAS using SSH key authentication.

## Prerequisites

✅ SSH configured with `galactica` host alias in `~/.ssh/config`
✅ Key-based authentication working (`ssh galactica` logs in without password)
✅ Docker installed on Synology NAS

## One-Command Deployment

```bash
./deploy-to-synology.sh
```

That's it! The script will:

1. ✅ Test SSH connection to `galactica`
2. 📁 Create directory structure on NAS
3. 📦 Copy application files
4. ⚙️ Set up environment configuration
5. 🐳 Start Docker containers
6. 🗄️ Run database migrations
7. 📥 Optionally import legacy MUD data

## What Happens During Deployment

### 1. File Transfer

Application files are copied to `/volume1/docker/muditor/` on your NAS:

```
/volume1/docker/muditor/
├── docker-compose.yml
├── .env
├── muditor/            # Application code
├── postgres-data/      # Database storage
└── redis-data/         # Cache storage
```

### 2. Environment Configuration

On first deployment, you'll need to edit `.env` on the NAS:

```bash
ssh galactica
cd /volume1/docker/muditor
vi .env
```

**Required values to set:**

- `DATABASE_PASSWORD` - Choose a strong password
- `REDIS_PASSWORD` - Choose a strong password
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` - Generate with: `openssl rand -base64 32`

The API URL is pre-configured to use `http://galactica:4000/graphql`.

### 3. Service Startup

Four Docker containers will start:

- **PostgreSQL 16** (port 5432) - Database
- **Redis 7** (port 6379) - Cache
- **NestJS API** (port 4000) - GraphQL backend
- **Next.js Web** (port 3002) - Frontend

### 4. Data Import (Optional)

When prompted, you can import legacy MUD world data from FieryMUD's `lib/` files. This creates:

- Zones (areas)
- Rooms (locations)
- Mobs (NPCs)
- Objects (items)
- Shops
- Default user accounts

## Accessing Your Application

After deployment completes:

**Web Interface:**

```
http://galactica:3002
```

**GraphQL API:**

```
http://galactica:4000/graphql
```

**Default Login** (if you imported with `--with-users`):

- Username: `admin`
- Password: `admin123`
- ⚠️ **Change this immediately!**

## Common Commands

### View Service Status

```bash
ssh galactica 'cd /volume1/docker/muditor && docker compose ps'
```

### View Logs

```bash
# All services
ssh galactica 'cd /volume1/docker/muditor && docker compose logs -f'

# Specific service
ssh galactica 'cd /volume1/docker/muditor && docker compose logs -f api'
ssh galactica 'cd /volume1/docker/muditor && docker compose logs -f web'
```

### Restart Services

```bash
ssh galactica 'cd /volume1/docker/muditor && docker compose restart'
```

### Stop Services

```bash
ssh galactica 'cd /volume1/docker/muditor && docker compose down'
```

### Update Application

```bash
# From your local machine
./deploy-to-synology.sh
```

### Access Database

```bash
ssh galactica
docker exec -it muditor-postgres psql -U muditor -d muditor
```

## Troubleshooting

### Connection Test

```bash
ssh galactica "echo 'Connection successful'"
```

### Check Docker Status

```bash
ssh galactica 'docker ps'
```

### View Container Logs

```bash
ssh galactica 'docker logs muditor-api'
ssh galactica 'docker logs muditor-web'
ssh galactica 'docker logs muditor-postgres'
```

### Check Port Availability

```bash
ssh galactica 'netstat -tuln | grep -E ":(5432|6379|4000|3002)"'
```

### Rebuild Containers

```bash
ssh galactica 'cd /volume1/docker/muditor && docker compose up -d --force-recreate'
```

## Next Steps

1. **Change default password** if you imported users
2. **Configure firewall** - Only expose port 3002 externally
3. **Set up HTTPS** - Use reverse proxy (nginx) with SSL certificate
4. **Configure backups** - Set up automated database backups
5. **Monitor resources** - Check memory and disk usage

## Environment Variables Reference

| Variable              | Description               | Example                         |
| --------------------- | ------------------------- | ------------------------------- |
| `DATABASE_NAME`       | PostgreSQL database name  | `muditor`                       |
| `DATABASE_USER`       | Database username         | `muditor`                       |
| `DATABASE_PASSWORD`   | Database password         | `secure_password_123`           |
| `REDIS_PASSWORD`      | Redis password            | `redis_password_456`            |
| `JWT_SECRET`          | JWT token signing key     | `random_base64_string`          |
| `JWT_REFRESH_SECRET`  | Refresh token key         | `random_base64_string`          |
| `NEXT_PUBLIC_API_URL` | API endpoint for frontend | `http://galactica:4000/graphql` |
| `API_PORT`            | API server port           | `4000`                          |
| `WEB_PORT`            | Web server port           | `3002`                          |

## Security Checklist

- [ ] Change default admin password
- [ ] Generate secure JWT secrets
- [ ] Use strong database passwords
- [ ] Restrict PostgreSQL to internal network only
- [ ] Restrict Redis to internal network only
- [ ] Configure firewall rules
- [ ] Set up HTTPS with reverse proxy
- [ ] Enable automatic security updates on NAS
- [ ] Configure regular backups
- [ ] Monitor access logs

## Support

For detailed documentation, see:

- `SYNOLOGY_DEPLOYMENT.md` - Complete deployment guide
- `../CLAUDE.md` - Project architecture overview
- `DEVELOPMENT_RULES.md` - Development conventions

---

**Quick Deploy**: `./deploy-to-synology.sh` → Edit `.env` → Access at `http://galactica:3002`
