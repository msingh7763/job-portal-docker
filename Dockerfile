# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS frontend-builder
WORKDIR /app/Frontend

COPY Frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

COPY Frontend/ ./
RUN npm run build

FROM node:22-alpine AS backend-deps
WORKDIR /app/Backend

COPY Backend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --no-audit --no-fund; else npm install --omit=dev --no-audit --no-fund; fi

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY --from=backend-deps /app/Backend/node_modules ./Backend/node_modules
COPY Backend/ ./Backend/
COPY --from=frontend-builder /app/Frontend/dist ./Frontend/dist

EXPOSE 5000
CMD ["node", "Backend/index.js"]
