FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable

# Manifestes du workspace
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/

# Installe uniquement les dépendances frontend
RUN pnpm install --frozen-lockfile --filter=frontend...

# Build Vite (VITE_API_BASE_URL vide = utilise /api via proxy nginx)
COPY frontend ./frontend
RUN cd frontend && pnpm build

# ── Serve avec nginx ──
FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
