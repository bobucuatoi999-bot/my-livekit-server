FROM livekit/livekit-server:latest

COPY livekit.yaml /livekit.yaml

# Use Railway's assigned PORT, default to 7880 if not set
CMD sh -c "livekit-server --config /livekit.yaml --port ${PORT:-7880} --bind 0.0.0.0"

