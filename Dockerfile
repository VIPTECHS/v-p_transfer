FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY server/prisma ./server/prisma/
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci
RUN npx prisma generate --schema=server/prisma/schema.prisma

# Build frontend
COPY . .
RUN npm run build:novsg

# Production image
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/server ./server

ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL="file:./data/prod.db"

EXPOSE 3001

RUN mkdir -p /app/data

COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/server/prisma ./server/prisma

CMD npx prisma migrate deploy --schema=server/prisma/schema.prisma && node server/index.js
