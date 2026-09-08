#!/bin/sh
set -e

echo "Running prisma db push..."
# Use pnpm exec to ensure prisma is found in the right context
pnpm --filter backend exec prisma db push

echo "Starting server..."
exec node packages/backend/dist/index.js