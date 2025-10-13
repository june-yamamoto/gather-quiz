# See here for image contents: https://github.com/devcontainers/images/tree/main/src/typescript-node
ARG VARIANT="20-bookworm"
FROM mcr.microsoft.com/devcontainers/typescript-node:${VARIANT}

# Install pnpm
RUN npm install -g pnpm

# Install Playwright dependencies
RUN npx playwright install-deps

# Install Japanese fonts
RUN sudo apt-get update && sudo apt-get install -y fonts-noto-cjk

# Install Gemini CLI
RUN npm install -g @google/gemini-cli

