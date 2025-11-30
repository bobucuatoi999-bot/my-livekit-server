# Dockerfile for LiveKit Server on Railway
# Uses official LiveKit server image

FROM livekit/livekit-server:latest

# Copy your config into the container
COPY livekit.yaml /livekit.yaml

# Run LiveKit using that config
ENTRYPOINT ["/livekit-server", "--config", "/livekit.yaml"]

