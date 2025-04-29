# Architecture & Tuning Notes

## ASGI Concurrency Model

The ASGI concurrency model allows for handling multiple connections simultaneously using an event loop. This is particularly useful for WebSocket services where real-time communication is required.

### Event Loop vs. Thread-Pool Work

- **Event Loop**: Ideal for I/O-bound tasks, such as handling WebSocket connections.
- **Thread-Pool**: Suitable for CPU-bound tasks, where blocking operations are offloaded to separate threads.

## Blue-Green Deployment

Blue-green deployment ensures zero-downtime releases by maintaining two identical environments. Traffic is switched between these environments to deploy updates without affecting the live service.

### Docker Layering

Utilize multi-stage Docker builds to optimize image size and build time. Separate build and runtime dependencies to ensure efficient deployment.

## Health Probes

Implement health probes to monitor the application's liveness and readiness. Use endpoints `/health` for liveness and `/ready` for readiness checks.

## Graceful Shutdown

Ensure graceful shutdown by handling `SIGTERM` signals to finish in-flight messages and close WebSocket connections properly.

## Configuration Separation

Maintain configuration separation to ensure environment-specific settings are managed independently. Use environment variables and configuration files to achieve this.