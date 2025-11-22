# ステージ1: ビルドステージ
FROM public.ecr.aws/lambda/nodejs:20 AS build

WORKDIR /var/task
ENV CI=true

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

# 依存関係をすべてインストール
RUN pnpm install --filter backend --ignore-scripts

# Prisma Clientを生成
RUN pnpm --filter backend exec prisma generate

# TypeScriptコードをビルド
RUN pnpm --filter backend build

# ステージ2: 最終イメージ
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}
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

# 本番用の依存関係のみをインストール
RUN pnpm install --filter backend --prod --ignore-scripts

# ビルドステージからビルド成果物とprismaスキーマをコピー
COPY --from=build /var/task/packages/backend/dist .
COPY --from=build /var/task/packages/backend/prisma ./prisma

# Lambdaハンドラを指定
CMD [ "lambda.handler" ]
