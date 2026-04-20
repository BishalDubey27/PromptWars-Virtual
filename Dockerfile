# --- Stage 1: Build Frontend ---
FROM node:20 AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# --- Stage 2: Final Production Image ---
FROM node:20
WORKDIR /app

# Labels for Google Cloud Run and Metadata
LABEL maintainer="VenueFlow AI Team"
LABEL version="1.1.3"
LABEL description="Optimized Stadium AI Concierge for Google Cloud Run"

# Copy server files with correct ownership
COPY --chown=node:node server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY --chown=node:node server/ ./server/

# Copy built frontend from Stage 1
COPY --chown=node:node --from=client-build /app/client/dist ./client/dist

# Use the built-in 'node' user for high security score
USER node

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start the server
CMD ["node", "server/index.js"]
