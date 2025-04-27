# Observability

## Metrics Catalogue

This document outlines the metrics available in the Django WebSocket service.

### Prometheus Metrics

- **Total Messages**: Counter for the total number of messages processed.
- **Active Connections**: Gauge for the number of active WebSocket connections.
- **Error Count**: Counter for the number of errors encountered.
- **Shutdown Time**: Histogram for the time taken to shut down the service.

## Dashboards

Grafana dashboards are pre-configured to visualize these metrics.

### Health Checks

- **Liveness Probe**: Endpoint `/healthz` to check if the service is alive.
- **Readiness Probe**: Endpoint `/readyz` to check if the service is ready to accept traffic.

## Alerts

Prometheus alerting rules are configured to trigger alerts based on the metrics.