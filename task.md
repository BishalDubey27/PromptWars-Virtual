# VenueFlow AI Task Checklist

## Phase 1: Foundation (Core MVP + Heatmap/Hype Zones)
- [x] Initialize Vite + React project (`client`)
- [x] Initialize Node.js + Express project (`server`)
- [x] Set up Vanilla CSS global design system (Glassmorphism, colors)
- [x] Create the interactive SVG stadium map component
- [x] Build real-time Node.js Simulation Engine for crowd density & "Hype" levels
- [x] Connect React frontend to backend via WebSocket (Socket.io)

## Phase 2: The Google Native Layer (Gemini + Vision + Translation)
- [x] Integrate Google Gemini API (Text) into backend
- [x] Build AI Concierge Chat UI with Web Speech API for TTS
- [x] Implement Gemini Vision API for "Snap & Know" image logic
- [x] Set up the Model Context Protocol (MCP) pattern for tool fetching
- [x] Build Live Announcer Translation mock feed + Translation UI

## Phase 3: Movement & Queues (Smart Queues, Wayfinding, Escape Router)
- [x] Build Queue Tracker UI + backend wait time logic
- [x] Implement `getFallbackResponse` in `server/gemini.js`
- [x] Update `handleChat` in `server/gemini.js` to use the fallback on 429 errors
- [x] Refine `client/src/components/Chat/Chatbot.jsx` typing indicator and error UI
- [x] Final UI Polish (spacing, glassmorphism consistencies)
- [x] End-to-end verification of chatbot fallbackde push notifications
- [x] Implement Indoor Pathfinding (Wayfinding algorithm via Gemini MCP layer)
- [x] Build Post-Game Escape staggared exit simulation

## Phase 4: Revenue & Polish (Seat Upgrades + Deployment)
- [x] Implement Dynamic Seat Upgrade push notifications
- [x] Set up `react-joyride` for First-Time User Onboarding tour
- [x] Polish UI with Framer Motion animations
- [x] Prepare Dockerfiles / docker-compose for Cloud Run Deployment

## Phase 5: Advanced Features
- [x] Implement Smart Ticket Scanner & Map Pulse Integration

## Phase 6: Stitch UI Prototyping
- [x] Create Stitch Project "VenueFlow AI Pro"
- [x] Implement Premium Dark/Neon Design System
- [x] Generate Core Main Dashboard Dashboard Screen
- [x] Generate AI Concierge/Upgrades Context Screen
