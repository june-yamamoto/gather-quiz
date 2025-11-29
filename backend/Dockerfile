# ステージ1: ビルドステージ
FROM public.ecr.aws/lambda/nodejs:20 AS build

WORKDIR /var/task
ENV CI=true

# 依存関係定義ファイルをコピー
COPY package.json .
COPY package-lock.json .

# ソースコードをコピー
COPY src ./src
COPY tsconfig.json .
COPY prisma ./prisma

RUN npm cache clean --force && npm install && npm rebuild

# Prismaスキーマを本番用(PostgreSQL)に書き換え
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma && \
    sed -i 's/url      = "file:.\/test.db"/url      = env("DATABASE_URL")/g' prisma/schema.prisma

# Amazon RDS CA証明書をダウンロードして配置
RUN curl -sS https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -o /etc/pki/tls/certs/rds-ca-bundle.pem && \
    chmod 644 /etc/pki/tls/certs/rds-ca-bundle.pem

ENV PGSSLROOTCERT=/etc/pki/tls/certs/rds-ca-bundle.pem

RUN rm -rf node_modules/.prisma && npm exec prisma generate --schema prisma/schema.prisma --preview-feature=driverAdapters

RUN npm run build

# --- ステージ2: 最終イメージ ---
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT} # /var/task

ENV NODE_ENV=production

# ビルドステージからビルド成果物を全てルートにコピー
COPY --from=build /var/task/dist/. . 
# distの中身をルートにコピー
COPY --from=build /var/task/node_modules ./node_modules
COPY --from=build /var/task/prisma ./prisma 
# prismaディレクトリ自体はPrisma Clientが読み込むので残す

# Lambdaハンドラを指定 (ルートにあると仮定)
CMD [ "lambda.handler" ]
