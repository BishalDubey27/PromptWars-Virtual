# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/client

# Accept Firebase API key as build arg so Vite can embed it
ARG VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY

COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Production Image
FROM node:20-slim
WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/
COPY --from=frontend-builder /app/client/dist ./client/dist

# Non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
USER nodejs

WORKDIR /app/server
EXPOSE 8080

ENV NODE_ENV=production
ENV GOOGLE_CLOUD_PROJECT=promptwars-virtual-493813

CMD ["node", "index.js"]
