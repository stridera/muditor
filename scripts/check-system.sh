#!/bin/bash

# Check Muditor system status
set -e

echo "🔍 Checking Muditor system status..."

# Check Docker services
echo "📦 Docker services:"
if docker compose ps --format table; then
    echo "✅ Docker services status checked"
else
    echo "❌ Docker compose not available or services not running"
fi

# Check if development servers are running
echo ""
echo "🌐 Development servers:"

if pgrep -f "next dev" > /dev/null; then
    echo "✅ Next.js web server is running"
else
    echo "❌ Next.js web server is not running"
fi

if pgrep -f "nest start" > /dev/null; then
    echo "✅ NestJS API server is running"
else
    echo "❌ NestJS API server is not running"
fi

# Check ports
echo ""
echo "🔌 Port availability:"
for port in 3000 3001 5432 6379; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "✅ Port $port is in use"
    else
        echo "❌ Port $port is available"
    fi
done

echo ""
echo "📊 System status check complete!"