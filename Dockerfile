FROM livekit/livekit-server:latest

COPY livekit.yaml /livekit.yaml

CMD ["livekit-server", "--config", "/livekit.yaml", "--bind", "0.0.0.0"]

