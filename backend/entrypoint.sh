#!/bin/sh
set -e

echo "→ Migration Prisma..."
# pnpm peut hoister prisma à la racine ou dans backend/node_modules
PRISMA_BIN=""
if [ -f /app/node_modules/.bin/prisma ]; then
  PRISMA_BIN="/app/node_modules/.bin/prisma"
elif [ -f /app/backend/node_modules/.bin/prisma ]; then
  PRISMA_BIN="/app/backend/node_modules/.bin/prisma"
else
  echo "Prisma CLI introuvable" && exit 1
fi

$PRISMA_BIN migrate deploy --schema=/app/backend/prisma/schema.prisma

echo "→ Démarrage NestJS..."
exec node /app/backend/dist/main.js
