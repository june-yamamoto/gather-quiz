# 最終ステージ: アプリケーションのビルドと実行を単一ステージで完結させる
FROM node:20-slim
WORKDIR /app
ENV CI=true
ENV NODE_ENV=production

# PrismaのためのOpenSSLとpnpmをインストール
RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g pnpm

# 依存関係定義ファイルをコピー
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY package.json .
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# ソースコード全体をコピー
COPY . .

# 起動スクリプトに実行権限を付与
RUN chmod +x /app/start.sh

# 依存関係をすべてインストール（ビルドのためにdevDependenciesも含む）
RUN pnpm install --filter backend --ignore-scripts

# Prisma Clientを生成
RUN pnpm --filter backend exec prisma generate

# TypeScriptコードをビルド
RUN pnpm --filter backend build

# devDependenciesはprisma db pushで必要なため、削除しない
# RUN cd packages/backend && pnpm prune --prod --ignore-scripts

# 非ルートユーザーを設定
RUN addgroup --system app && adduser --system --ingroup app --home /home/app app
RUN chown -R app:app /app
USER app

# ポートを公開
EXPOSE 3000

# 起動スクリプトを実行
CMD ["/app/start.sh"]