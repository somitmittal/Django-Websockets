#!/bin/bash

# Blue-Green Deployment Script
set -e

# Configuration
BLUE_PORT=8000
GREEN_PORT=8001
PROXY_PORT=8080
HEALTH_CHECK_RETRIES=6
HEALTH_CHECK_DELAY=5

# Determine current active color
if [ -f ".active_color" ]; then
    ACTIVE_COLOR=$(cat .active_color)
else
    ACTIVE_COLOR="blue"
fi

# Determine next color
if [ "$ACTIVE_COLOR" = "blue" ]; then
    NEXT_COLOR="green"
    NEXT_PORT=$GREEN_PORT
else
    NEXT_COLOR="blue"
    NEXT_PORT=$BLUE_PORT
fi

echo "Current active: $ACTIVE_COLOR"
echo "Deploying to: $NEXT_COLOR"

# Build and start next color
echo "Starting $NEXT_COLOR stack..."
docker-compose up -d app_$NEXT_COLOR

# Wait for readiness
echo "Waiting for $NEXT_COLOR stack to be ready..."
for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -s "http://localhost:$NEXT_PORT/readyz/" | grep -q "Ready"; then
        echo "$NEXT_COLOR stack is ready"
        break
    fi
    
    if [ $i -eq $HEALTH_CHECK_RETRIES ]; then
        echo "$NEXT_COLOR stack failed to become ready"
        exit 1
    fi
    
    echo "Waiting for readiness... ($i/$HEALTH_CHECK_RETRIES)"
    sleep $HEALTH_CHECK_DELAY
done

# Run smoke tests
echo "Running smoke tests..."
pytest tests/smoke_test.py -v

# Switch traffic
echo "Switching traffic to $NEXT_COLOR stack..."
echo "set \$backend $NEXT_COLOR;" > .backend

# Update active color
echo $NEXT_COLOR > .active_color

# Gracefully stop old stack
echo "Stopping $ACTIVE_COLOR stack..."
docker-compose stop app_$ACTIVE_COLOR

echo "Deployment complete! Traffic now routing to $NEXT_COLOR stack"