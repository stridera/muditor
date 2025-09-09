#!/bin/bash

# Stop Muditor system services
set -e

echo "🛑 Stopping Muditor system..."

# Stop development servers (if running)
echo "🌐 Stopping development servers..."
pkill -f "next dev" || true
pkill -f "nest start" || true

# Stop Docker services
echo "📦 Stopping Docker services..."
docker compose down

echo "✅ Muditor system stopped successfully!"