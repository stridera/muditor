# Deployment Troubleshooting Guide

Common issues when deploying to Synology NAS and their solutions.

## SSH & Authentication Issues

### Issue: "Permission denied (publickey)"

**Cause**: SSH key authentication not working properly.

**Solution**:

```bash
# 1. Verify SSH config exists
cat ~/.ssh/config | grep -A 5 galactica

# 2. Test SSH connection manually
ssh galactica "echo 'Connection successful'"

# 3. Check SSH key permissions (should be 600)
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# 4. Verify key is added to ssh-agent
ssh-add -l

# 5. Add key if missing
ssh-add ~/.ssh/id_rsa
```

### Issue: "rsync: connection unexpectedly closed"

**Cause**: rsync not using SSH properly or permission issues.

**Solution**:

```bash
# The script now includes -e ssh flag, but you can test manually:
rsync -avz -e ssh --dry-run /path/to/muditor/ galactica:/volume1/docker/muditor/muditor/

# If that works, the issue may be file permissions on the NAS
ssh galactica "ls -la /volume1/docker/muditor/"
ssh galactica "chmod 755 /volume1/docker/muditor/"
```

### Issue: "Host key verification failed"

**Cause**: First-time connection or changed host key.

**Solution**:

```bash
# Accept the host key
ssh galactica

# Or remove old key and retry
ssh-keygen -R galactica
ssh galactica
```

## Docker Issues

### Issue: "docker: command not found"

**Cause**: Docker not installed on Synology NAS.

**Solution**:

1. Open Synology DSM web interface
2. Go to Package Center
3. Search for "Docker"
4. Install Docker package
5. Wait for installation to complete
6. Retry deployment

### Issue: "Cannot connect to Docker daemon"

**Cause**: Docker service not running or permission issues.

**Solution**:

```bash
# Check Docker status
ssh galactica "docker ps"

# If error, try restarting Docker via DSM:
# Control Panel → Terminal & SNMP → Run command:
ssh galactica "sudo synoservice --restart pkgctl-Docker"

# Or restart via Package Center UI
```

### Issue: "docker compose: command not found"

**Cause**: Using old Docker version with `docker-compose` (hyphen) instead of `docker compose` (space).

**Solution**:

```bash
# Check Docker Compose version
ssh galactica "docker compose version"

# If using old version, update the script or use docker-compose:
ssh galactica "docker-compose --version"

# Update docker-compose.yml commands in script if needed
```

## Port Conflicts

### Issue: "Address already in use"

**Cause**: Ports 5432, 6379, 4000, or 3002 already in use.

**Solution**:

```bash
# Check what's using the ports
ssh galactica "netstat -tuln | grep -E ':(5432|6379|4000|3002)'"

# Find processes using the ports
ssh galactica "lsof -i :5432"
ssh galactica "lsof -i :6379"
ssh galactica "lsof -i :4000"
ssh galactica "lsof -i :3002"

# Option 1: Stop conflicting services
ssh galactica "docker stop <container-name>"

# Option 2: Change ports in .env file
ssh galactica "vi /volume1/docker/muditor/.env"
# Edit: API_PORT=4001, WEB_PORT=3003, etc.
```

## File Permission Issues

### Issue: "Permission denied" when creating directories

**Cause**: User doesn't have write permissions.

**Solution**:

```bash
# Check current user
ssh galactica "whoami"

# Check directory permissions
ssh galactica "ls -la /volume1/docker/"

# Create directory with proper permissions
ssh galactica "sudo mkdir -p /volume1/docker/muditor"
ssh galactica "sudo chown $(whoami):users /volume1/docker/muditor"
ssh galactica "chmod 755 /volume1/docker/muditor"
```

## Database Issues

### Issue: "database does not exist"

**Cause**: Database not initialized or migrations not run.

**Solution**:

```bash
# Check if PostgreSQL is running
ssh galactica "cd /volume1/docker/muditor && docker compose ps postgres"

# Check PostgreSQL logs
ssh galactica "cd /volume1/docker/muditor && docker compose logs postgres"

# Recreate database
ssh galactica "cd /volume1/docker/muditor && docker compose exec postgres createdb -U muditor muditor"

# Run migrations
ssh galactica "cd /volume1/docker/muditor && docker compose exec api pnpm db:migrate deploy"
```

### Issue: "password authentication failed"

**Cause**: Wrong password in .env file or DATABASE_URL.

**Solution**:

```bash
# Check .env file
ssh galactica "cat /volume1/docker/muditor/.env | grep DATABASE"

# Verify DATABASE_URL matches the individual variables
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Test connection manually
ssh galactica "docker compose exec postgres psql -U muditor -d muditor -c 'SELECT 1;'"
```

## Application Issues

### Issue: API returns "Internal Server Error"

**Cause**: Various - check logs for details.

**Solution**:

```bash
# View API logs
ssh galactica "cd /volume1/docker/muditor && docker compose logs api"

# Common issues:
# 1. Prisma client not generated
ssh galactica "cd /volume1/docker/muditor && docker compose exec api pnpm db:generate"

# 2. Missing environment variables
ssh galactica "cd /volume1/docker/muditor && docker compose exec api env | grep -E '(DATABASE|JWT|REDIS)'"

# 3. Database connection failed
ssh galactica "cd /volume1/docker/muditor && docker compose exec api pnpm db:migrate status"
```

### Issue: Web UI shows "Failed to fetch"

**Cause**: API not accessible or wrong API URL.

**Solution**:

```bash
# Check if API is running
ssh galactica "cd /volume1/docker/muditor && docker compose ps api"

# Test API endpoint
curl http://galactica:4000/graphql

# Check NEXT_PUBLIC_API_URL
ssh galactica "cat /volume1/docker/muditor/.env | grep NEXT_PUBLIC_API_URL"

# Verify from your browser's network tab that it's trying the right URL
```

## Resource Issues

### Issue: "Out of memory" errors

**Cause**: Insufficient memory allocated to Docker.

**Solution**:

1. Open DSM
2. Go to Docker package
3. Settings → Resources
4. Increase memory limit (recommended: 4GB minimum)
5. Apply and restart containers

### Issue: "No space left on device"

**Cause**: Disk full.

**Solution**:

```bash
# Check disk usage
ssh galactica "df -h"

# Check Docker disk usage
ssh galactica "docker system df"

# Clean up Docker
ssh galactica "docker system prune -a"

# Remove old images
ssh galactica "docker image prune -a"
```

## Network Issues

### Issue: Cannot access application from browser

**Cause**: Firewall blocking ports or wrong hostname.

**Solution**:

```bash
# 1. Check if services are listening
ssh galactica "netstat -tuln | grep -E ':(4000|3002)'"

# 2. Test from NAS itself
ssh galactica "curl http://localhost:4000/graphql"
ssh galactica "curl http://localhost:3002"

# 3. Test from your machine
curl http://galactica:4000/graphql

# 4. Check DSM firewall rules
# Control Panel → Security → Firewall
# Ensure ports 3002 and 4000 are allowed

# 5. Try IP address instead of hostname
# Get NAS IP
ssh galactica "hostname -I"
# Then: http://[IP]:3002
```

### Issue: DNS resolution fails for 'galactica'

**Cause**: Hostname not in DNS or /etc/hosts.

**Solution**:

```bash
# Option 1: Add to /etc/hosts
echo "192.168.x.x galactica" | sudo tee -a /etc/hosts

# Option 2: Use IP address directly
# Update .env:
NEXT_PUBLIC_API_URL=http://192.168.x.x:4000/graphql

# Option 3: Configure local DNS server
# Add entry in your router's DNS settings
```

## Deployment Script Issues

### Issue: Script hangs at "Copying files"

**Cause**: Large file transfer or network issue.

**Solution**:

```bash
# Cancel with Ctrl+C and try with verbose mode
rsync -avz --progress -e ssh \
  --exclude 'node_modules' \
  /path/to/muditor/ galactica:/volume1/docker/muditor/muditor/

# Or copy in stages
rsync -avz -e ssh /path/to/muditor/apps galactica:/volume1/docker/muditor/muditor/
rsync -avz -e ssh /path/to/muditor/packages galactica:/volume1/docker/muditor/muditor/
```

### Issue: ".env file not found" errors

**Cause**: Environment file not created or in wrong location.

**Solution**:

```bash
# Check if .env exists
ssh galactica "ls -la /volume1/docker/muditor/.env"

# Create from template
ssh galactica "cp /volume1/docker/muditor/.env.synology.example /volume1/docker/muditor/.env"

# Edit with required values
ssh galactica "vi /volume1/docker/muditor/.env"
```

## Verification Commands

### Complete Health Check

Run these commands to verify everything is working:

```bash
# 1. SSH connection
ssh galactica "echo 'SSH OK'"

# 2. Docker running
ssh galactica "docker ps"

# 3. Muditor containers running
ssh galactica "cd /volume1/docker/muditor && docker compose ps"

# 4. PostgreSQL healthy
ssh galactica "cd /volume1/docker/muditor && docker compose exec postgres pg_isready"

# 5. Redis healthy
ssh galactica "cd /volume1/docker/muditor && docker compose exec redis redis-cli ping"

# 6. API responding
curl http://galactica:4000/graphql -H "Content-Type: application/json" -d '{"query":"{ __schema { types { name } } }"}'

# 7. Web UI responding
curl -I http://galactica:3002

# 8. Database connected
ssh galactica "cd /volume1/docker/muditor && docker compose exec api pnpm prisma db execute --stdin <<< 'SELECT 1;'"
```

### Get Detailed Status

```bash
# All container logs
ssh galactica "cd /volume1/docker/muditor && docker compose logs --tail=50"

# Container resource usage
ssh galactica "docker stats --no-stream"

# Disk usage
ssh galactica "du -sh /volume1/docker/muditor/*"

# Network connectivity
ssh galactica "cd /volume1/docker/muditor && docker compose exec api ping -c 3 postgres"
ssh galactica "cd /volume1/docker/muditor && docker compose exec api ping -c 3 redis"
```

## Emergency Recovery

### Complete Reset

If nothing works, start fresh:

```bash
# 1. Stop all containers
ssh galactica "cd /volume1/docker/muditor && docker compose down -v"

# 2. Remove all data (WARNING: destroys database!)
ssh galactica "rm -rf /volume1/docker/muditor/*"

# 3. Redeploy
./deploy-to-synology.sh
```

### Backup Before Reset

```bash
# Backup database
ssh galactica "cd /volume1/docker/muditor && docker compose exec postgres pg_dump -U muditor muditor > backup.sql"

# Download backup
scp galactica:/volume1/docker/muditor/backup.sql ./muditor-backup-$(date +%Y%m%d).sql

# Backup .env
scp galactica:/volume1/docker/muditor/.env ./muditor-env-backup

# After reset, restore:
scp ./muditor-backup-*.sql galactica:/volume1/docker/muditor/restore.sql
ssh galactica "cd /volume1/docker/muditor && docker compose exec -T postgres psql -U muditor muditor < restore.sql"
```

## Getting Help

### Collect Debug Information

```bash
# Create debug report
ssh galactica "cd /volume1/docker/muditor && cat << 'EOF' > debug-report.txt
=== System Info ===
$(uname -a)
$(docker --version)
$(docker compose version)

=== Container Status ===
$(docker compose ps)

=== Container Logs (last 100 lines) ===
$(docker compose logs --tail=100)

=== Environment (sanitized) ===
$(cat .env | sed 's/=.*/=***REDACTED***/g')

=== Network ===
$(netstat -tuln | grep -E ':(5432|6379|4000|3002)')

=== Disk Usage ===
$(df -h /volume1)
$(du -sh *)
EOF"

# Download report
scp galactica:/volume1/docker/muditor/debug-report.txt ./debug-report.txt
```

### Contact Points

1. Check documentation: `SYNOLOGY_DEPLOYMENT.md`, `DEPLOYMENT_QUICKSTART.md`
2. Review logs for error messages
3. Search project issues on GitHub
4. Include debug report when asking for help

---

**Quick Fix**: Most issues are resolved by restarting containers:

```bash
ssh galactica "cd /volume1/docker/muditor && docker compose restart"
```
