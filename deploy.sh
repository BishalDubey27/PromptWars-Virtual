#!/bin/bash
set -e

# ── Config ────────────────────────────────────────────────────────────────────
PROJECT_ID="promptwars-virtual-493813"
REGION="us-central1"
SERVICE="venueflow-ai"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE"

# ── Pre-flight checks ─────────────────────────────────────────────────────────
if [ -z "$VITE_FIREBASE_API_KEY" ]; then
  echo "❌  VITE_FIREBASE_API_KEY is not set. Export it before running this script."
  echo "    export VITE_FIREBASE_API_KEY=your_key_here"
  exit 1
fi

echo "🚀  Deploying VenueFlow AI to Cloud Run..."
echo "    Project : $PROJECT_ID"
echo "    Region  : $REGION"
echo "    Service : $SERVICE"
echo ""

# ── Build & push image ────────────────────────────────────────────────────────
echo "📦  Building Docker image..."
docker build \
  --build-arg VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
  -t "$IMAGE:latest" \
  .

echo "⬆️   Pushing image to Container Registry..."
docker push "$IMAGE:latest"

# ── Store secrets in Secret Manager (idempotent) ─────────────────────────────
echo "🔐  Syncing secrets to Secret Manager..."

store_secret() {
  local name=$1
  local value=$2
  if gcloud secrets describe "$name" --project="$PROJECT_ID" &>/dev/null; then
    echo "$value" | gcloud secrets versions add "$name" --data-file=- --project="$PROJECT_ID"
  else
    echo "$value" | gcloud secrets create "$name" --data-file=- --project="$PROJECT_ID"
  fi
}

# Pull from local server/.env if GEMINI_API_KEY not already exported
if [ -z "$GEMINI_API_KEY" ] && [ -f "server/.env" ]; then
  export GEMINI_API_KEY=$(grep GEMINI_API_KEY server/.env | cut -d '=' -f2)
fi

[ -n "$GEMINI_API_KEY" ] && store_secret "GEMINI_API_KEY" "$GEMINI_API_KEY"

# ── Deploy to Cloud Run ───────────────────────────────────────────────────────
echo "☁️   Deploying to Cloud Run..."
gcloud run deploy "$SERVICE" \
  --image "$IMAGE:latest" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --project "$PROJECT_ID"

# ── Get service URL and update ALLOWED_ORIGINS ───────────────────────────────
SERVICE_URL=$(gcloud run services describe "$SERVICE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format "value(status.url)")

echo ""
echo "✅  Deployed! Service URL: $SERVICE_URL"
echo ""
echo "🔧  Updating ALLOWED_ORIGINS secret to: $SERVICE_URL"
store_secret "ALLOWED_ORIGINS" "$SERVICE_URL"

# Re-deploy to pick up the updated ALLOWED_ORIGINS secret
gcloud run services update "$SERVICE" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest,ALLOWED_ORIGINS=ALLOWED_ORIGINS:latest"

echo ""
echo "🎉  Done! VenueFlow AI is live at: $SERVICE_URL"
