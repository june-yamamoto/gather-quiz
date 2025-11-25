# ステージ1: ビルドステージ
FROM public.ecr.aws/lambda/nodejs:20 AS build

WORKDIR /var/task
ENV CI=true

# npm を使用するため、pnpm のインストールは不要

# 依存関係定義ファイルをコピー
COPY package.json .
COPY package-lock.json .
# packages/frontend/package.json のコピーは不要になりました

# ソースコード全体をコピー (Lambdaハンドラがあるディレクトリ)
COPY . .

# 依存関係をインストール (npm)
RUN npm cache clean --force && npm install && npm rebuild

# Prisma Clientを生成
RUN rm -rf node_modules/.prisma && npm exec prisma generate

# TypeScriptコードをビルド
RUN npm run build

# ステージ2: 最終イメージ (ランタイムイメージ)
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}
ENV NODE_ENV=production

# ビルドステージからビルド成果物とprismaスキーマをコピー
# dist ディレクトリの代わりに、ビルドされた js ファイルと map ファイルをコピー
COPY --from=build /var/task/dist/* .
COPY --from=build /var/task/prisma ./prisma

# Node.js ランタイムでモジュールを解決できるように node_modules をコピー
COPY --from=build /var/task/node_modules ./node_modules

# Lambdaハンドラを指定
CMD [ "lambda.handler" ]