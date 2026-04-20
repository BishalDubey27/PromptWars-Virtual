# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Final Production Image
FROM node:20-slim
WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source and built frontend
COPY server/ ./server/
COPY --from=frontend-builder /app/client/dist ./client/dist

# Use non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
USER nodejs

WORKDIR /app/server
EXPOSE 8080
ENV NODE_ENV=production
ENV GOOGLE_CLOUD_PROJECT=promptwars-virtual-493813

CMD ["node", "index.js"]
