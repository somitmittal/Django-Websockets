#!/bin/bash

# Monitor script for observability

while true; do
    # Tail container logs for ERROR, only if containers exist
    for cname in app_blue app_green; do
        if docker ps --format '{{.Names}}' | grep -q "^$cname$"; then
            docker logs --tail 10 "$cname" 2>&1 | grep "ERROR"
        fi
    done

    # Hit /metrics and print top-5 counters
    curl -s http://localhost/metrics | head -n 5

    sleep 10

done