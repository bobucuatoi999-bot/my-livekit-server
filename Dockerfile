FROM livekit/livekit-server:latest

COPY livekit.yaml /livekit.yaml

# Use the array format to run the binary directly
# We use the shell form for the bind address to ensure it captures the ENV variable properly if needed,
# but the cleanest way is this:
ENTRYPOINT ["/livekit-server"]
CMD ["--config", "/livekit.yaml", "--bind", "0.0.0.0"]

