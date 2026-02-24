#!/bin/bash

# Start Muditor system services
set -e

echo "🚀 Starting Muditor system..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start database services
echo "📦 Starting database services..."
docker compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Generate Prisma client
echo "🔧 Generating Prisma client..."
bun run db:generate

# Run migrations
echo "📊 Running database migrations..."
bun run db:migrate

# Start development servers
echo "🌐 Starting development servers..."
bun run run dev

echo "✅ Muditor system started successfully!"
echo "🌐 Web app: http://localhost:3000"
echo "🔗 API: http://localhost:3001/graphql"
echo "📊 Database Studio: bun run db:studio"
