# --- Stage 1: Build Frontend ---
FROM node:20-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# --- Stage 2: Final Production Image ---
FROM node:20-slim
WORKDIR /app

# Labels for Google Cloud Run and Metadata
LABEL maintainer="VenueFlow AI Team"
LABEL version="1.1.1"
LABEL description="Optimized Stadium AI Concierge for Google Cloud Run"

# Create a non-root user and set up workspace permissions
RUN groupadd -r venueflow && useradd -r -g venueflow venueflow
RUN chown venueflow:venueflow /app

# Copy server files with correct ownership
COPY --chown=venueflow:venueflow server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY --chown=venueflow:venueflow server/ ./server/

# Copy built frontend from Stage 1 with correct ownership
COPY --chown=venueflow:venueflow --from=client-build /app/client/dist ./client/dist

# Use non-root user for security
USER venueflow

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Cloud Run handles health checks via the listening port. 
# Removing custom HEALTHCHECK to prevent local wget failures from failing the revision.

# Start the server
CMD ["node", "server/index.js"]
