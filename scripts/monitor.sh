#!/bin/bash

# Monitor script for observability

while true; do
    # Tail container logs for ERROR
    docker logs --tail 10 app_blue | grep "ERROR"
    docker logs --tail 10 app_green | grep "ERROR"

    # Hit /metrics and print top-5 counters
    curl -s http://localhost:8000/metrics | head -n 5

    sleep 10

done