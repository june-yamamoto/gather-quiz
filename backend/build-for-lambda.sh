#!/bin/bash
set -e

# このスクリプトは、Lambda関数とLambdaレイヤーのためのデプロイパッケージを準備します。

# 1. ディレクトリとファイル名の定義
TIMESTAMP=$(date +%s)
WORKSPACE_ROOT=$(pwd)
# packages/backend は存在しないため、ルート直下の backend を指定
BACKEND_DIR="$WORKSPACE_ROOT/backend"
if [ ! -d "$BACKEND_DIR" ]; then
  # backendディレクトリで実行されている場合のフォールバック
  BACKEND_DIR="$WORKSPACE_ROOT"
fi
BUILD_DIR="$BACKEND_DIR/build"

# レイヤー用の設定
LAYER_DIR="$BUILD_DIR/lambda-layer"
LAYER_NODEJS_DIR="$LAYER_DIR/nodejs"
export LAYER_ZIP_FILENAME="dependencies-$TIMESTAMP.zip"
LAYER_ZIP_FILE="$BUILD_DIR/$LAYER_ZIP_FILENAME"

# 関数用の設定
FUNCTION_DIR="$BUILD_DIR/lambda-function"
export FUNCTION_ZIP_FILENAME="function-$TIMESTAMP.zip"
FUNCTION_ZIP_FILE="$BUILD_DIR/$FUNCTION_ZIP_FILENAME"

echo "Lambdaパッケージング処理を開始します..."

# 2. 前回のビルド成果物をクリーンアップ
echo "前回のビルド成果物をクリーンアップします..."
rm -rf "$BUILD_DIR"
mkdir -p "$LAYER_NODEJS_DIR"
mkdir -p "$FUNCTION_DIR"

# 3. バックエンドのビルド (TypeScriptのコンパイル)
echo "バックエンドアプリケーションをビルドします..."
# pnpm buildはPrisma Clientの生成も行うため、ここでは実行しない
# レイヤー作成時にエンジンを生成するため、ここではtscのみ実行
cd "$BACKEND_DIR"
pnpm exec tsc
cd "$WORKSPACE_ROOT"

# 4. Lambdaレイヤーの準備 (npmを使用)
echo "Lambdaレイヤーのパッケージを作成します (npmを使用)..."
# package.jsonをコピーして、npmで本番依存関係をインストール
cp "$BACKEND_DIR/package.json" "$LAYER_NODEJS_DIR/"
echo "レイヤー用のpackage.jsonからpostinstallスクリプトを削除します..."
jq 'del(.scripts.postinstall)' "$LAYER_NODEJS_DIR/package.json" > "$LAYER_NODEJS_DIR/package.json.tmp" && mv "$LAYER_NODEJS_DIR/package.json.tmp" "$LAYER_NODEJS_DIR/package.json"
cd "$LAYER_NODEJS_DIR"
npm install --omit=dev
# node-pruneで不要なファイルを削除
echo "node-pruneでnode_modulesを最適化します..."
npx node-prune
# Prismaスキーマをコピーし、レイヤーのnode_modules内でエンジンを生成
# レイヤー内でPrisma Clientのエンジンを生成します...
cp -r "$BACKEND_DIR/prisma" .
npx prisma generate
# 一時的にコピーしたスキーマを削除
rm -rf ./prisma

# Prismaエンジンの不要なバイナリを削除してサイズを削減
echo "不要なPrismaエンジンバイナリを削除します..."
find . -name "libquery_engine-*" -not -name "*linux-x86_64-openssl-3.0.x*" -delete
find . -name "schema-engine-*" -not -name "*linux-x86_64-openssl-3.0.x*" -delete

# 診断: サイズの大きいディレクトリをリストアップ
echo "node_modules内のサイズが大きいトップ20ディレクトリ:"
du -sh node_modules/* | sort -rh | head -n 20

cd "$WORKSPACE_ROOT" # ディレクトリを元に戻す

# レイヤーディレクトリをzip化
echo "レイヤーをzip化します..."
cd "$LAYER_DIR"
zip -r --symlinks "$LAYER_ZIP_FILE" .
cd "$WORKSPACE_ROOT"

# 5. Lambda関数の準備
echo "Lambda関数のパッケージを作成します..."
# ビルドされたコードと関連ファイルを関数ディレクトリにコピー
cp -r "$BACKEND_DIR/dist" "$FUNCTION_DIR/dist"
cp -r "$BACKEND_DIR/prisma" "$FUNCTION_DIR/prisma"
# 関数ディレクトリをzip化
cd "$FUNCTION_DIR"
zip -r "$FUNCTION_ZIP_FILE" .
cd "$WORKSPACE_ROOT" # ディレクトリを元に戻す

echo "--------------------------------------------------"
echo "Lambdaパッケージが正常に作成されました！"
echo "関数用パッケージ: $FUNCTION_ZIP_FILE"
echo "レイヤー用パッケージ: $LAYER_ZIP_FILE"
echo "--------------------------------------------------"
