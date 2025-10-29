# 1. 依存関係インストールステージ
FROM node:20-slim AS deps

WORKDIR /app

# pnpmのインストール
RUN npm install -g pnpm

# ワークスペースの依存関係定義をコピー
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# 依存関係のインストール
RUN pnpm install --filter backend --prod --ignore-scripts


# 2. ビルドステージ
FROM node:20-slim AS builder

WORKDIR /app

# pnpmのインストール
RUN npm install -g pnpm

# 必要な設定ファイルとソースコードをコピー
COPY . .

# 依存関係をdepsステージからコピー
COPY --from=deps /app/node_modules ./node_modules

# Prisma Clientの再生成（ビルド環境に合わせて）
RUN pnpm --filter backend exec prisma generate

# TypeScriptのビルド
RUN pnpm --filter backend build


# 3. 実行ステージ
FROM node:20-slim

WORKDIR /app

# 必要なファイルのみをコピー
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY packages/backend/prisma ./prisma

# ポートを開放
EXPOSE 3000

# アプリケーションの起動時にマイグレーションを実行
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/index.js"]
