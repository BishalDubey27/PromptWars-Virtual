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

# Labels for Google Cloud Run and Metadata
LABEL maintainer="VenueFlow AI Team"
LABEL version="1.1.0"
LABEL description="Optimized Stadium AI Concierge for Google Cloud Run"

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/

# Copy built frontend from Stage 1 to server's expected static path
COPY --from=client-build /app/client/dist ./client/dist

# Use non-root user for security (WCAG & CIS compliance)
RUN addgroup -S venueflow && adduser -S venueflow -G venueflow
USER venueflow

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Healthcheck for GCR
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/healthz || exit 1

# Start the server
CMD ["node", "server/index.js"]
