#!/bin/bash

# Muditor Synology NAS Deployment Script
# Usage: ./deploy-to-synology.sh [SSH_HOST] [--skip-prompts|--update]

set -e

# Parse arguments
SSH_HOST="galactica"
SKIP_PROMPTS=false

for arg in "$@"; do
  case $arg in
    --skip-prompts|--update)
      SKIP_PROMPTS=true
      shift
      ;;
    *)
      SSH_HOST="$arg"
      shift
      ;;
  esac
done

# Configuration
NAS_DIR="/volume1/docker/muditor"
LOCAL_DIR="$(pwd)"

echo "🚀 Muditor Synology Deployment Script"
echo "======================================"
echo "SSH Host: $SSH_HOST"
echo "NAS Directory: $NAS_DIR"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v ssh >/dev/null 2>&1 || { echo "❌ SSH not found. Please install OpenSSH."; exit 1; }
command -v tar >/dev/null 2>&1 || { echo "❌ tar not found. Please install tar."; exit 1; }

# Test SSH connection
echo "🔐 Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 "$SSH_HOST" "echo 'Connection successful'"; then
    echo "❌ Cannot connect to NAS. Please check:"
    echo "   1. SSH is enabled and '$SSH_HOST' is configured in ~/.ssh/config"
    echo "   2. SSH key authentication is working"
    echo "   3. NAS is reachable on the network"
    exit 1
fi

# Create directory structure on NAS
echo "📁 Creating directory structure on NAS..."
ssh "$SSH_HOST" "mkdir -p $NAS_DIR/{postgres-data,redis-data,muditor}"

# Copy necessary files
echo "📦 Copying application files..."
echo "   Using tar over SSH (SFTP not available on NAS)..."
tar czf - \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'build' \
    --exclude '.next' \
    --exclude 'postgres-data' \
    --exclude 'redis-data' \
    --exclude 'coverage' \
    --exclude '.turbo' \
    -C "$LOCAL_DIR" . | ssh "$SSH_HOST" "cd $NAS_DIR/muditor && tar xzf -"

# Copy docker-compose file
echo "🐳 Copying Docker Compose configuration..."
cat "$LOCAL_DIR/docker-compose.synology.yml" | ssh "$SSH_HOST" "cat > $NAS_DIR/docker-compose.yml"

# Copy environment template if .env doesn't exist
echo "⚙️  Checking environment configuration..."
if ssh "$SSH_HOST" "[ ! -f $NAS_DIR/.env ]"; then
    echo "📝 Creating .env file from template..."
    cat "$LOCAL_DIR/.env.synology.example" | ssh "$SSH_HOST" "cat > $NAS_DIR/.env"
    echo ""
    echo "⚠️  IMPORTANT: Please edit $NAS_DIR/.env on your NAS and set:"
    echo "   - DATABASE_PASSWORD"
    echo "   - REDIS_PASSWORD"
    echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "   - JWT_REFRESH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - NEXT_PUBLIC_GRAPHQL_URL"
    echo "   - NEXT_PUBLIC_API_URL"
    echo ""
    if [ "$SKIP_PROMPTS" = false ]; then
        read -p "Press Enter after updating .env file..."
    else
        echo "⚠️  Skipping prompt (--skip-prompts flag set)"
    fi
else
    echo "✅ .env file already exists, skipping..."
fi

# Import legacy data using FieryLib
IMPORT_DATA="N"
if [ "$SKIP_PROMPTS" = false ]; then
    echo "📚 Do you want to import legacy MUD data? (y/N)"
    read -r IMPORT_DATA
else
    echo "📚 Skipping data import (--skip-prompts flag set)"
fi

if [[ "$IMPORT_DATA" =~ ^[Yy]$ ]]; then
    echo "📥 Copying FieryLib import tool..."
    tar czf - \
        --exclude '__pycache__' \
        --exclude '.venv' \
        --exclude 'poetry.lock' \
        -C "$LOCAL_DIR/../fierylib" . | ssh "$SSH_HOST" "mkdir -p $NAS_DIR/fierylib && cd $NAS_DIR/fierylib && tar xzf -"

    echo "📥 Copying legacy data..."
    tar czf - -C "$LOCAL_DIR/../fierymud/legacy/lib" . | ssh "$SSH_HOST" "mkdir -p $NAS_DIR/legacy-lib && cd $NAS_DIR/legacy-lib && tar xzf -"
fi

# Start or restart services
if [ "$SKIP_PROMPTS" = true ]; then
    echo "🔄 Restarting Docker services on NAS..."
    ssh "$SSH_HOST" "cd $NAS_DIR && /usr/local/bin/docker compose restart"
    echo "⏳ Waiting for services to restart..."
    sleep 15
else
    echo "🚀 Starting Docker services on NAS..."
    ssh "$SSH_HOST" "cd $NAS_DIR && /usr/local/bin/docker compose up -d"
    echo "⏳ Waiting for services to start..."
    sleep 10

    # Run database migrations (only on fresh install)
    echo "🗄️  Running database migrations..."
    ssh "$SSH_HOST" "cd $NAS_DIR && /usr/local/bin/docker compose exec -T api sh -c 'pnpm db:migrate deploy'"
fi

# Import data if requested
if [[ "$IMPORT_DATA" =~ ^[Yy]$ ]]; then
    echo "📥 Importing legacy data (this may take several minutes)..."
    ssh "$SSH_HOST" "cd $NAS_DIR/fierylib && docker run --rm -v \$(pwd):/app -w /app --network muditor-network python:3.11 sh -c 'pip install poetry && poetry install && poetry run fierylib import-legacy --with-users'"
fi

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
ssh "$SSH_HOST" "cd $NAS_DIR && /usr/local/bin/docker compose ps"
echo ""

# Get NAS hostname/IP for access URLs
NAS_HOST=$(ssh "$SSH_HOST" "hostname -I | awk '{print \$1}'")
echo "🌐 Access your application at:"
echo "   Web UI: http://$NAS_HOST:3002"
echo "   GraphQL API: http://$NAS_HOST:4000/graphql"
echo "   (Or use 'galactica' if DNS is configured)"
echo ""
echo "📝 Useful commands:"
echo "   View logs: ssh $SSH_HOST 'cd $NAS_DIR && docker compose logs -f'"
echo "   Restart: ssh $SSH_HOST 'cd $NAS_DIR && docker compose restart'"
echo "   Stop: ssh $SSH_HOST 'cd $NAS_DIR && docker compose down'"
echo "   Update code: ./deploy-to-synology.sh --update"
echo "   Fresh install: ./deploy-to-synology.sh"
echo ""
