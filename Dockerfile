FROM livekit/livekit-server:latest

COPY livekit.yaml /livekit.yaml

# Fixed: Proper shell command structure
CMD ["/bin/sh", "-c", "livekit-server --config /livekit.yaml --port ${PORT:-7880} --bind 0.0.0.0"]

