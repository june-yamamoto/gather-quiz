# 最終ステージ: アプリケーションのビルドと実行を単一ステージで完結させる
FROM node:20-slim
WORKDIR /app
ENV CI=true
ENV NODE_ENV=production

# pnpmをグローバルにインストール
RUN npm install -g pnpm

# 依存関係定義ファイルをコピー
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY package.json .
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# ソースコード全体をコピー
COPY . .

# 依存関係をすべてインストール（ビルドのためにdevDependenciesも含む）
RUN pnpm install --filter backend --ignore-scripts

# Prisma Clientを生成
RUN pnpm --filter backend exec prisma generate

# TypeScriptコードをビルド
RUN pnpm --filter backend build

# devDependenciesを削除してイメージサイズを削減
RUN cd packages/backend && pnpm prune --prod --ignore-scripts

# 非ルートユーザーを設定
RUN addgroup --system app && adduser --system --ingroup app app
RUN chown -R app:app /app
USER app

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["node", "packages/backend/dist/index.js"]