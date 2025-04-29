#!/bin/bash

# Promote script for blue-green deployment

# Build and start the next color
NEXT_COLOR=$1
CURRENT_COLOR=$2

if [ "$NEXT_COLOR" == "blue" ]; then
    docker-compose up --build -d app_blue
    APP_PORT=8000
elif [ "$NEXT_COLOR" == "green" ]; then
    docker-compose up --build -d app_green
    APP_PORT=8001
else
    echo "Invalid color specified. Use 'blue' or 'green'."
    exit 1
fi

# Run smoke tests
echo "Running smoke tests for $NEXT_COLOR..."
# Wait for the app to start
sleep 10
if ! curl -fsS "http://localhost:$APP_PORT/health"; then
    echo "Smoke test failed: /health endpoint not healthy"
    exit 1
fi
if ! curl -fsS "http://localhost:$APP_PORT/metrics" | grep -q "python_gc_objects_collected_total"; then
    echo "Smoke test failed: /metrics endpoint not reporting expected metrics"
    exit 1
fi
echo "Smoke tests passed."

# Flip traffic
if [ "$NEXT_COLOR" == "blue" ]; then
    docker-compose stop app_green
elif [ "$NEXT_COLOR" == "green" ]; then
    docker-compose stop app_blue
fi

# Retire the old color
if [ "$CURRENT_COLOR" == "blue" ]; then
    docker-compose down app_blue
elif [ "$CURRENT_COLOR" == "green" ]; then
    docker-compose down app_green
fi

echo "Promotion to $NEXT_COLOR complete."