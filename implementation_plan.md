# VenueFlow AI — Smart Stadium Experience Platform

## Problem Statement
> Design a solution that improves the physical event experience for attendees at large-scale sporting venues. The system should address challenges such as crowd movement, waiting times, and real-time coordination, while ensuring a seamless and enjoyable experience.

## Solution Concept: **VenueFlow AI**

A **real-time, AI-powered stadium companion app** that transforms the fan experience at large-scale sporting venues. It uses live data from IoT sensors, ticketing systems, and AI predictions to help fans navigate crowds, skip queues, pre-order food, get emergency alerts, and enjoy a personalized event experience — all from their phone.

### Why This Wins
| Differentiator | How We Stand Out |
|---|---|
| **Google Cloud Native** | Built on Gemini API, Vision API, Firebase, Cloud Run — shows Google ecosystem mastery |
| **Visual Impact** | Stunning 3D-style heatmap of crowd density and "Hype Zones", glassmorphic UI |
| **Multi-modal AI** | "Snap & Know" feature using device cameras, and live audio-to-text translations |
| **Real-World Viability** | Solves actual pain points every stadium-goer has experienced |
| **Revenue Driver** | Dynamic seat upgrades show clear business value for stadiums |

---

## Submission Requirements Checklist

- [ ] **GitHub Repository** — public repo with clean code and README
- [ ] **Live Preview (MVP)** — deployed on Cloud Run or Firebase Hosting
- [ ] **Blog Post** — "Build-in-Public" journey on LinkedIn/dev.to
- [ ] **AI Tool Usage** — demonstrate use of Google Antigravity / AI tools

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | Vite + React | Fast dev, hot reload, modern DX |
| **Styling** | Vanilla CSS + CSS Variables | Premium glassmorphic design system |
| **Maps/Heatmap** | HTML5 Canvas + Custom SVG | Interactive stadium map with crowd density overlay |
| **AI Text & Vision** | Google Gemini API (Text & Vision) | Context-aware stadium concierge & "Snap & Know" |
| **AI Extensibility** | Model Context Protocol (MCP) | Allows AI to fetch live context (sports data, weather) natively |
| **Voice/Audio** | Web Speech API (TTS) | Voice output for AI chat and emergency alerts |
| **Backend** | Node.js + Express | API server for real-time data |
| **Real-time** | WebSocket (Socket.io) | Live crowd updates, push notifications |
| **Database** | Firebase Firestore | Real-time sync, attendee data |
| **Deployment** | Google Cloud Run | Serverless, scalable |

---

## Core Features (Expanded Scope)

### 1. 🗺️ Live Stadium Heatmap & "Hype Zones"
**Problem:** Fans have no visibility into which areas are crowded.
**Solution:**
- Interactive SVG/Canvas stadium map showing real-time crowd density (🟢 Low → 🟡 Moderate → 🔴 High)
- **NEW:** **Hype Zones** — visually map which sections of the stadium are the loudest or most energetic, creating a gamified "Section vs. Section" feel.
**Implementation:** WebSocket-powered updates, CSS transitions for density and energy color changes.

### 2. ⏱️ Smart Queue Tracker & 🏃‍♂️ Post-Game Escape Router
**Problem:** Long lines during the game, and chaotic stampedes leaving the stadium after.
**Solution:**
- Real-time estimated wait times for every amenity with virtual queueing.
- **NEW:** **Post-Game Escape Router** — staggers attendee exits dynamically. Tells Section 200: "Stay in your seats for 5 mins, grab a discounted drink. We'll notify you when the South Exit clears up."
**Implementation:** Queue simulation engine, predictive exit models, and push notifications via WebSocket.

### 3. 🤖 AI Stadium Concierge & 📸 "Snap & Know" Vision
**Problem:** Fans have questions, staff is scarce, and fans want to know what's happening on the field.
**Solution:**
- Natural language chatbot powered by Google Gemini with **Voice Output (TTS)** for hands-free assistance.
- **NEW:** **Snap & Know** — Fans point their camera at the field or a player. The app uses Gemini Vision to instantly identify the player, show live stats, or explain the referee's last call.
**Implementation:** Gemini API (Text and Vision). We will use the **Model Context Protocol (MCP)** to allow Gemini to dynamically fetch live tools (stadium weather, real-time sports APIs, etc.) for high-quality, accurate responses.

### 4. 🎟️ AI Dynamic Seat Upgrade
**Problem:** Unused premium seats represent lost revenue for venues.
**Solution:**
- **NEW:** If a user is in a crowded upper section and there are empty premium seats, the AI dynamically pings them at halftime: "Upgrade to Section 112 for the second half for $15."
**Implementation:** Backend job matching user locations with empty seat availability, triggering Firebase notifications.

### 5. 🌐 Accessibility & Alerts (Live Translation & TTS)
**Problem:** Safety incidents require coordination, and international/visually impaired fans need inclusive communication.
**Solution:**
- Real-time emergency notifications with AI-dynamic evacuation routing.
- **NEW:** **Live Announcer Translation & Voice** — Translates stadium PA announcements instantly to the user's native language, utilizing **Voice Output (TTS)** to read alerts aloud for accessibility.
**Implementation:** Gemini transcription/translation pipelines sent through WebSockets, paired with Web Speech API for playback.

### 6. 🧭 Indoor Wayfinding & Navigation
**Solution:** Turn-by-turn directions within the stadium that dynamically reroute to avoid congested corridors.

### 7. 🍔 Food & Beverage Pre-Ordering & 🎮 Fan Engagement
**Solution:** Browse menus, prepay from seats, plus halftime AR trivia/polls.

### 8. 🎓 First-Time User Onboarding & App Walkthrough
**Problem:** A feature-rich app can overwhelm new fans attending their first event.
**Solution:**
- Interactive, guided "coach-mark" tour that highlights the Heatmap, AI Concierge, and Smart Queue tracker when the user logs in for the first time.
- Contextual tooltips that explain features as the user navigates to them.
**Implementation:** State management in React context to track `hasCompletedOnboarding` flag, utilizing a library like React Joyride for a smooth, high-quality highlight tour.

---

## User Review Required

> [!WARNING]
> **Massive Scope Alert:** We have officially expanded to encompass ALL 5 standout features. This means the project now has highly complex front-end requirements (Camera access, WebSockets, Canvas) and heavy API integration (Gemini Text, Gemini Vision). 
> 
> **Are we fully committed to attempting this entire scope?** We will need to move extremely fast, heavily leveraging mock data on the backend to achieve the front-end "wow" factor.

---

## Open Questions

1. **Focus on Mocking vs. Reality:** Since features like "Seat Upgrades" and "Hype Zones" rely on data we don't physically have, I plan to build a robust "Simulation Engine" into our Node backend to generate fake crowd and hype data continuously. Does this sound good?
2. **Vision API Approach:** For "Snap & Know," the user will upload a photo they take, and we will send it to the Gemini Vision API alongside some context. Is that acceptable?

---

## Build Phases (Updated)

### Phase 1: Foundation (Core MVP + Heatmap/Hype Zones)
1. Initialize Vite + React project with design system
2. Build the stadium SVG map with interactive zones
3. Set up Node.js simulation engine for crowd density + "Hype" levels
4. Implement WebSocket syncing

### Phase 2: The Google Native Layer (Gemini + Vision + Translation)
1. Build Chat UI for AI Concierge
2. Implement Gemini Vision API for "Snap & Know" camera feature
3. Implement the mock live announcement feed + translation panel

### Phase 3: Movement & Queues (Smart Queues, Wayfinding, Escape Router)
1. Build Queue Tracker UI and backend logic
2. Implement the Post-Game Escape stagger logic
3. Build indoor pathfinding

### Phase 4: Revenue & Polish (Seat Upgrades + Deployment)
1. Build the Dynamic Seat Upgrade push notification system
2. Create Interactive User Onboarding Walkthrough for first-time users
3. Add glassmorphic polish and Framer Motion animations
4. Deploy to Google Cloud Run

---

### Phase 5: Advanced Demo Enhancements (Voice Food Orders & Smart Map Tracking)
To push the MVP further and truly capitalize on the AI capabilities:
1. **Drone In-Seat Food Delivery (AI Voice Ordering):** Fans can use the AI voice chatbot to order food to their seats. Gemini will call a new `placeFoodOrder` MCP tool, emitting a backend WebSockets event that visually surfaces an animated "Drone Delivery Tracker" on the UI.
2. **Smart Ticket Scan to Map Integration:** A dedicated ticket scanner button that not only uses Vision to extract Section/Row but natively triggers the SVG map to pinpoint and visually glow precisely on their specific zone.

---

## Verification Plan

### Automated Tests
- Run `npm run dev` on client and server to verify startup.
- WebSocket load testing for simulated users.

### Manual Verification
- Upload test images to the "Snap & Know" feature to verify Gemini Vision handles sports context.
- Verify the Heatmap pulses/changes colors for both Density and Hype mode.
- Trigger a "Game Over" simulation to watch the Escape Router stagger exits successfully.
