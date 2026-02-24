#!/bin/bash

# Development server manager for muditor API
# Usage: ./dev-server.sh [start|stop|restart|status]

API_PORT=4000
API_LOGFILE="/tmp/muditor-api.log"
API_PIDFILE="/tmp/muditor-api.pid"

start_server() {
    if [ -f "$API_PIDFILE" ] && kill -0 $(cat "$API_PIDFILE") 2>/dev/null; then
        echo "❌ API server is already running (PID: $(cat $API_PIDFILE))"
        exit 1
    fi

    echo "🚀 Starting API server on port $API_PORT..."

    # Kill any existing process on the port
    lsof -ti:$API_PORT | xargs kill -9 2>/dev/null || true

    # Start the server in background
    cd "$(dirname "$0")"
    PORT=$API_PORT bun run --filter @muditor/api dev > "$API_LOGFILE" 2>&1 &
    echo $! > "$API_PIDFILE"

    echo "⏳ Waiting for server to start..."
    sleep 5

    if kill -0 $(cat "$API_PIDFILE") 2>/dev/null; then
        echo "✅ API server started successfully (PID: $(cat $API_PIDFILE))"
        echo "📊 GraphQL Playground: http://localhost:$API_PORT/graphql"
        echo "📝 Logs: tail -f $API_LOGFILE"
    else
        echo "❌ Failed to start API server. Check logs: $API_LOGFILE"
        rm -f "$API_PIDFILE"
        exit 1
    fi
}

stop_server() {
    if [ ! -f "$API_PIDFILE" ]; then
        echo "⚠️  No PID file found"
        lsof -ti:$API_PORT | xargs kill -9 2>/dev/null || true
        echo "✅ Killed any processes on port $API_PORT"
        return
    fi

    PID=$(cat "$API_PIDFILE")
    if kill -0 $PID 2>/dev/null; then
        echo "🛑 Stopping API server (PID: $PID)..."
        kill $PID
        sleep 2

        if kill -0 $PID 2>/dev/null; then
            echo "⚠️  Force killing..."
            kill -9 $PID
        fi

        echo "✅ API server stopped"
    else
        echo "⚠️  Process not running (stale PID file)"
    fi

    rm -f "$API_PIDFILE"
}

restart_server() {
    stop_server
    sleep 1
    start_server
}

status_server() {
    if [ -f "$API_PIDFILE" ] && kill -0 $(cat "$API_PIDFILE") 2>/dev/null; then
        PID=$(cat "$API_PIDFILE")
        echo "✅ API server is running (PID: $PID)"
        echo "📊 Port: $API_PORT"
        echo "📝 Logs: $API_LOGFILE"

        # Show recent logs
        echo ""
        echo "Recent logs:"
        tail -10 "$API_LOGFILE"
    else
        echo "❌ API server is not running"
        [ -f "$API_PIDFILE" ] && rm -f "$API_PIDFILE"
        exit 1
    fi
}

case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        status_server
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
