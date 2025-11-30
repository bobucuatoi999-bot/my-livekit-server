# LiveKit Server - Railway Deployment

This repository contains the configuration files needed to deploy LiveKit server on Railway.

## Quick Start

1. Push this folder to a new GitHub repository
2. Follow the deployment guide in `RAILWAY_DEPLOYMENT_GUIDE.md` in the main project

## Files

- `livekit.yaml` - LiveKit server configuration
- `Dockerfile` - Docker configuration for Railway
- `.dockerignore` - Files to exclude from Docker build

## Important Notes

- This configuration uses TCP-only mode (Railway blocks UDP)
- Redis is required and must be deployed separately on Railway
- Environment variables will override the config file values

