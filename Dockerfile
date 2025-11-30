FROM livekit/livekit-server:latest

COPY livekit.yaml /livekit.yaml

# Use Railway's dynamic PORT, fallback to 7880
CMD sh -c "livekit-server --config /livekit.yaml --port ${PORT:-7880} --bind 0.0.0.0"

