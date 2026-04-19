# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# --- Stage 2: Final Production Image ---
FROM node:20-alpine
WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/

# Copy built frontend from Stage 1 to server's expected static path
COPY --from=client-build /app/client/dist ./client/dist

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start the server (which now serves the frontend)
CMD ["node", "server/index.js"]
