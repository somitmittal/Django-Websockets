#!/bin/bash

# Promote script for blue-green deployment

# Build and start the next color
NEXT_COLOR=$1
CURRENT_COLOR=$2

if [ "$NEXT_COLOR" == "blue" ]; then
    docker-compose up --build -d app_blue
elif [ "$NEXT_COLOR" == "green" ]; then
    docker-compose up --build -d app_green
else
    echo "Invalid color specified. Use 'blue' or 'green'."
    exit 1
fi

# Run smoke tests
# Add your smoke test commands here

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