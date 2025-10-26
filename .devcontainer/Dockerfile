# See here for image contents: https://github.com/devcontainers/images/tree/main/src/typescript-node
ARG VARIANT="20-bookworm"
FROM mcr.microsoft.com/devcontainers/typescript-node:${VARIANT}

# Install pnpm
RUN npm install -g pnpm

# Install Playwright dependencies
RUN npx playwright install-deps

# Install Japanese fonts
RUN apt-get update && apt-get install -y fonts-noto-cjk xvfb

# Install Gemini CLI
RUN npm install -g @google/gemini-cli

# Install GitHub CLI (gh)
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    chmod a+r /usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list && \
    apt-get update && \
    apt-get install -y gh \
    # Install AWS CLI
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip \
    && rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/lib/apt/lists/*