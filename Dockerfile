# Dockerfile for LiveKit Server on Railway
# Uses official LiveKit server image

FROM livekit/livekit-server:latest

WORKDIR /app

# Copy your config into the container
COPY livekit.yaml /app/livekit.yaml

# Don't use ENTRYPOINT - let Railway control startup
# Bind to 0.0.0.0 to accept connections from Railway's network
CMD ["livekit-server", "--config", "/app/livekit.yaml", "--bind", "0.0.0.0"]

