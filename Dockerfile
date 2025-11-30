# Dockerfile for LiveKit Server on Railway
# Uses official LiveKit server image

FROM livekit/livekit-server:latest

# Copy your config into the container
COPY livekit.yaml /livekit.yaml

# Run LiveKit using that config
# Using CMD instead of ENTRYPOINT for Railway compatibility
CMD ["/livekit-server", "--config", "/livekit.yaml"]

