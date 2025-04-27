# Django WebScocket Service

This repository contains a Django-based WebSocket service with blue-green deployment capabilities, observability features, and a CI pipeline.

## Getting Started

### Prerequisites
- Docker
- Docker Compose
- Python 3.8+

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd SigAI
   ```
3. Build and start the Docker containers:
   ```bash
   docker-compose up --build
   ```

### Running the Load Test
To run the load test using Locust:
```bash
make load-test
```

### Blue-Green Deployment
To switch between blue and green deployments:
```bash
./scripts/promote.sh
```

## Observability
- Metrics are exposed at `/metrics`.
- Health checks are available at `/healthz` and `/readyz`.

## CI Pipeline
The CI pipeline is configured to build, test, and deploy the application using GitHub Actions.

## Documentation
- [DESIGN.md](docs/DESIGN.md): Architecture and tuning notes.
- [OBSERVABILITY.md](docs/OBSERVABILITY.md): Metrics catalogue and dashboards.

## Optional
A short 5-minute Loom or GIF walkthrough of the deployment and metrics can be added.