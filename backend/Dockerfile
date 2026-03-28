FROM node:20-alpine
WORKDIR /app

# Active pnpm via corepack (inclus dans Node 20)
RUN corepack enable

# Copie les manifestes du workspace en premier (cache Docker)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/

# Installe uniquement les dépendances du backend
RUN pnpm install --frozen-lockfile --filter=backend...

# Copie le code source du backend
COPY backend ./backend

# Génère le client Prisma et compile TypeScript
RUN cd backend && pnpm prisma generate && pnpm build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "backend/dist/main.js"]
