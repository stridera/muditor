# Synology NAS Deployment Guide

This guide covers deploying Muditor to a Synology NAS using Docker Compose.

## Prerequisites

### On Your Synology NAS

1. **Install Docker** via Package Center
   - Open Package Center in DSM
   - Search for "Docker" and install it
   - Verify installation: `docker --version`

2. **Enable SSH Access**
   - Go to Control Panel → Terminal & SNMP
   - Enable SSH service (default port 22)
   - Apply changes

3. **Create Admin User** (if not already available)
   - Go to Control Panel → User & Group
   - Ensure you have admin privileges

4. **Reserve Ports**
   - Default ports needed: 5432 (PostgreSQL), 6379 (Redis), 4000 (API), 3002 (Web)
   - Check if ports are available or modify in `.env` file

### On Your Local Machine

1. **SSH Client** (usually pre-installed on Linux/Mac)
2. **rsync** for file synchronization
3. **Git** to clone the repository (optional)

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

1. **Clone or download the Muditor repository**

   ```bash
   git clone <repository-url>
   cd muditor
   ```

2. **Run the deployment script**

   ```bash
   ./deploy-to-synology.sh
   # Uses 'galactica' SSH host by default
   # Or specify a different host: ./deploy-to-synology.sh my-nas
   ```

3. **Follow the prompts**
   - The script will copy files to your NAS
   - Edit the `.env` file when prompted
   - Choose whether to import legacy data

4. **Access your application**
   - Web UI: `http://galactica:3002` or `http://[NAS-IP]:3002`
   - GraphQL API: `http://galactica:4000/graphql` or `http://[NAS-IP]:4000/graphql`

### Method 2: Manual Deployment

1. **SSH into your Synology NAS**

   ```bash
   ssh galactica
   ```

2. **Create directory structure**

   ```bash
   mkdir -p /volume1/docker/muditor/{postgres-data,redis-data}
   cd /volume1/docker/muditor
   ```

3. **Copy files from your local machine**

   ```bash
   # From your local machine (not SSH session)
   rsync -avz --exclude 'node_modules' \
     /path/to/muditor/ galactica:/volume1/docker/muditor/muditor/

   scp docker-compose.synology.yml galactica:/volume1/docker/muditor/docker-compose.yml
   scp .env.synology.example galactica:/volume1/docker/muditor/.env
   ```

4. **Edit environment variables** (on NAS via SSH)

   ```bash
   cd /volume1/docker/muditor
   vi .env  # or use nano

   # Set these required values:
   # - DATABASE_PASSWORD
   # - REDIS_PASSWORD
   # - JWT_SECRET (generate with: openssl rand -base64 32)
   # - JWT_REFRESH_SECRET
   # - NEXT_PUBLIC_API_URL=http://galactica:4000/graphql
   ```

5. **Start services**

   ```bash
   cd /volume1/docker/muditor
   docker compose up -d
   ```

6. **Run database migrations**

   ```bash
   docker compose exec api sh -c 'pnpm db:migrate deploy'
   ```

7. **Import legacy data** (optional, using FieryLib)
   ```bash
   # Copy FieryLib and legacy data to NAS first
   cd /volume1/docker/muditor/fierylib
   docker run --rm -v $(pwd):/app -w /app --network muditor-network \
     python:3.11 sh -c \
     'pip install poetry && poetry install && poetry run fierylib import-legacy --with-users'
   ```

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_NAME=muditor
DATABASE_USER=muditor
DATABASE_PASSWORD=your_strong_password_here
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=your_redis_password_here
REDIS_PORT=6379

# Application
API_PORT=4000
WEB_PORT=3002

# Security (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# API URL (update with your NAS IP or domain)
NEXT_PUBLIC_API_URL=http://galactica:4000/graphql
```

### Generating Secure Secrets

```bash
# Generate JWT secrets on your local machine or NAS
openssl rand -base64 32
```

## Post-Deployment

### Verify Services are Running

```bash
ssh galactica
cd /volume1/docker/muditor
docker compose ps
```

Expected output:

```
NAME                COMMAND                  STATUS              PORTS
muditor-api         "sh -c 'apk add --no…"   Up (healthy)        0.0.0.0:4000->4000/tcp
muditor-postgres    "docker-entrypoint.s…"   Up (healthy)        0.0.0.0:5432->5432/tcp
muditor-redis       "docker-entrypoint.s…"   Up (healthy)        0.0.0.0:6379->6379/tcp
muditor-web         "sh -c 'apk add --no…"   Up                  0.0.0.0:3002->3000/tcp
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
```

### Access the Application

1. **Web UI**: http://galactica:3002 or http://[NAS-IP]:3002
2. **GraphQL Playground**: http://galactica:4000/graphql or http://[NAS-IP]:4000/graphql
3. **Database** (from NAS): `psql -U muditor -d muditor`

### Default User Credentials

If you imported data with `--with-users` flag:

- **Username**: `admin`
- **Password**: `admin123` (change immediately!)
- **Role**: GOD

## Maintenance

### Update Application

```bash
# From your local machine
./deploy-to-synology.sh
```

### Restart Services

```bash
ssh galactica
cd /volume1/docker/muditor
docker compose restart
```

### Stop Services

```bash
docker compose down
```

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U muditor muditor > backup_$(date +%Y%m%d).sql

# Restore backup
docker compose exec -T postgres psql -U muditor muditor < backup_20250129.sql
```

### View Resource Usage

```bash
docker stats
```

## Troubleshooting

### Services Won't Start

1. **Check logs**:

   ```bash
   docker compose logs
   ```

2. **Check port availability**:

   ```bash
   netstat -tuln | grep -E ':(5432|6379|4000|3002)'
   ```

3. **Verify environment variables**:
   ```bash
   cat .env
   ```

### Database Connection Issues

1. **Check PostgreSQL is running**:

   ```bash
   docker compose exec postgres pg_isready -U muditor
   ```

2. **Verify DATABASE_URL**:

   ```bash
   echo $DATABASE_URL
   ```

3. **Check database logs**:
   ```bash
   docker compose logs postgres
   ```

### API Not Responding

1. **Check API logs**:

   ```bash
   docker compose logs api
   ```

2. **Verify Prisma client is generated**:

   ```bash
   docker compose exec api sh -c 'pnpm db:generate'
   ```

3. **Rebuild API container**:
   ```bash
   docker compose up -d --force-recreate api
   ```

### Web UI Not Loading

1. **Check web logs**:

   ```bash
   docker compose logs web
   ```

2. **Verify API URL**:

   ```bash
   grep NEXT_PUBLIC_API_URL .env
   ```

3. **Clear Next.js cache and rebuild**:
   ```bash
   docker compose exec web sh -c 'rm -rf .next && pnpm --filter @muditor/web build'
   ```

### Out of Memory

1. **Check Docker memory limits**:
   - Open Docker app in DSM
   - Go to Settings → Resources
   - Increase memory allocation

2. **Reduce concurrent builds**:
   - Build services one at a time:
     ```bash
     docker compose up -d postgres redis
     docker compose up -d api
     docker compose up -d web
     ```

## Security Considerations

### Network Security

1. **Firewall Configuration**
   - Only expose necessary ports (3002 for web access)
   - Keep PostgreSQL (5432) and Redis (6379) internal
   - Use reverse proxy (nginx) for HTTPS

2. **Reverse Proxy Setup** (Optional)
   - Install nginx via Package Center
   - Configure SSL certificate (Let's Encrypt)
   - Proxy traffic to Muditor containers

### Application Security

1. **Change Default Credentials**
   - Log in with default admin account
   - Change password immediately
   - Create individual user accounts

2. **Secure Environment Variables**

   ```bash
   chmod 600 /volume1/docker/muditor/.env
   ```

3. **Regular Updates**
   - Keep DSM updated
   - Update Docker images regularly
   - Monitor security advisories

## Performance Optimization

### Database Tuning

Edit `docker-compose.yml` and add PostgreSQL configuration:

```yaml
postgres:
  command: >
    postgres
    -c shared_buffers=256MB
    -c max_connections=100
    -c effective_cache_size=1GB
```

### Redis Configuration

```yaml
redis:
  command: >
    redis-server
    --appendonly yes
    --requirepass ${REDIS_PASSWORD}
    --maxmemory 256mb
    --maxmemory-policy allkeys-lru
```

### Enable Caching

Ensure Redis is properly connected for GraphQL caching and session management.

## Monitoring

### Setup Automatic Health Checks

The Docker Compose file includes health checks. View status:

```bash
docker compose ps
```

### Log Rotation

Configure log rotation to prevent disk space issues:

```bash
# Add to docker-compose.yml under each service
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Advanced Configuration

### Using Custom Domain

1. **Configure DNS** to point to your NAS IP
2. **Update environment variables**:
   ```bash
   NEXT_PUBLIC_API_URL=https://muditor.yourdomain.com/graphql
   ```
3. **Setup SSL** via reverse proxy

### Running on Non-Default Ports

Edit `.env` file:

```bash
API_PORT=8080
WEB_PORT=8081
POSTGRES_PORT=5433
REDIS_PORT=6380
```

### Database Connection Pooling

For production environments, consider adding pgBouncer:

```yaml
pgbouncer:
  image: edoburu/pgbouncer:latest
  environment:
    DATABASE_URL: postgresql://muditor:password@postgres:5432/muditor
    MAX_CLIENT_CONN: 100
    DEFAULT_POOL_SIZE: 20
```

## Support

For issues or questions:

1. Check logs: `docker compose logs`
2. Review this documentation
3. Check project GitHub issues
4. Contact system administrator

## Appendix

### File Structure on NAS

```
/volume1/docker/muditor/
├── docker-compose.yml      # Production configuration
├── .env                    # Environment variables (DO NOT COMMIT)
├── postgres-data/          # PostgreSQL data (auto-created)
├── redis-data/             # Redis data (auto-created)
├── muditor/                # Application source code
│   ├── apps/
│   │   ├── api/            # NestJS API
│   │   └── web/            # Next.js frontend
│   ├── packages/
│   │   ├── db/             # Prisma schema
│   │   ├── types/          # Shared types
│   │   └── ui/             # Shared UI components
│   └── package.json
├── fierylib/               # Optional: Legacy data importer
└── legacy-lib/             # Optional: Legacy MUD files
```

### Container Resource Limits

Recommended resource allocation:

- **PostgreSQL**: 512MB-1GB RAM, 2 CPU cores
- **Redis**: 256MB RAM, 1 CPU core
- **API**: 512MB RAM, 1 CPU core
- **Web**: 512MB RAM, 1 CPU core

**Total**: ~2GB RAM minimum, 4-8GB recommended

### Network Diagram

```
Internet → Synology NAS → Docker Bridge Network
                           ├── muditor-postgres:5432
                           ├── muditor-redis:6379
                           ├── muditor-api:4000 → postgres + redis
                           └── muditor-web:3000 → api
```
