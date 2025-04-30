#!/bin/bash

# Monitor Script for WebSocket Service
set -e

# Configuration
METRICS_URL="http://localhost:8080/metrics"
LOG_FILE="websocket_monitor.log"
REFRESH_INTERVAL=10

# Function to fetch and display metrics
fetch_metrics() {
    echo "=== Metrics at $(date) ==="
    curl -s $METRICS_URL | grep -E "websocket_(messages_total|connections_active|errors_total)" | sort -r | head -n 5
    echo
}

# Function to tail logs for errors
tail_logs() {
    echo "Monitoring logs for errors..."
    docker-compose logs -f | grep -i "error" >> $LOG_FILE &
    TAIL_PID=$!
}

# Cleanup function
cleanup() {
    echo "Stopping log monitoring..."
    kill $TAIL_PID 2>/dev/null
    exit 0
}

# Register cleanup
trap cleanup EXIT

# Start log monitoring
tail_logs

# Main monitoring loop
while true; do
    fetch_metrics
    sleep $REFRESH_INTERVAL
done