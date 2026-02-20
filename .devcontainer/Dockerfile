# Dev Container for Islakayd — installs sandbox dependencies required by the workspace
# Uses Microsoft's Node.js devcontainer base image for consistency with VS Code
FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

# Install system packages required by the sandbox/runtime
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ripgrep \
    bubblewrap \
    socat \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Ensure the default non-root 'vscode' user remains the active user (base image already does this)
USER vscode
