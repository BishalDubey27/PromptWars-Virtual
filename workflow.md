# VenueFlow AI Walkthrough / Workflow

## Overview
This document serves as the living workflow and walkthrough for the VenueFlow AI project. As we complete features, we will document how they were implemented and summarize the testing and validation steps here.

## Completed Modules

*(To be filled as we build them)*

### 1. Foundation & Map
- **Description:** Set up the global glassmorphic design system and the dynamic SVG Stadium Map dashboard. Implemented a backend Node.js simulation engine that broadcasts random fluctuations in "Crowd Density" and "Hype Levels" across four zones (North, South, East, West).
- **Tech Used:** Vite, React, Framer Motion, Vanilla CSS (Variables), Node.js, Express, Socket.io
- **Verification:** Verified that `App.jsx` handles state toggling between Density/Hype, and that `StadiumMap.jsx` successfully listens to standard websocket broadcasts from `localhost:3001` and fluidly animates SVG path colors.

### 2. AI Concierge & TTS
- **Description:** Implemented the Google Native Layer by setting up Gemini and Gemini Vision. Built the "Stadium Concierge" a glassmorphic chatbot that leverages the MCP (Model Context Protocol) to pull live data internally, and uses the Web Speech API (TTS) to read replies aloud. Also included a "Snap & Know" button that lets fans upload images for instant contextual analysis by the Vision model, and a "Live Announcer" widget that mocks stadium announcements, translates them, and reads them out in the translated language.
- **Tech Used:** `@google/generative-ai`, Web Speech API (TTS), Context function-calling (MCP Pattern), FileReader (Base64 uploads)
- **Verification:** Verified chat toggles on screen, parses local images to base64, hits localhost endpoints nicely (handling failures gracefully if the API key isn't provided yet). Validated TTS readout triggers properly upon receiving AI response. 

### 3. Queue & Escape Routing
- **Description:** Added a live Queue Tracker to the dashboard that displays bathroom and concession wait times, dynamically updating via live WebSockets. We introduced a `getWalkingRoute` MCP function seamlessly directly into the Google Native layer, allowing the AI to construct indoor wayfinding on the fly for fans asking about exits or facilities. Finally, implemented the "Post-Game Escape" logic with an admin button to broadcast simulated tiered exit instructions directly out to all connected client maps.
- **Tech Used:** WebSockets (Socket.io), State Management, Google Gemini Tool parameters.
- **Verification:** Clicking the "Post-Game Router" emits the event from the server and instantly expands the escape strategy tab under the queues menu on the client. The AI properly maps responses using localized pathing logic. 

### 4. Dynamic Revenue & Polish
- **Description:** Implemented the "Seat Upgrades" Socket push notification system on the backend, driving targeted seat upgrade offers down to the fan's dashboard via shiny glassmorphic popups. Integrated `react-joyride` to build a 4-step onboarding flow for first-time users, highlighting the core metrics, map, queues, and AI concierge elements. Finally, constructed the `Dockerfile` and `docker-compose` setup to make both the `client` and `server` instantly ready to be dropped into Google Cloud Run for scalability.
- **Tech Used:** Socket.io Event Emitting, `react-joyride`, Docker.
- **Verification:** Clicking the "Tour" button gracefully anchors and guides the user through the 4 critical dashboard features. The UI animations remain smooth across toggles and modal overlays. Docker configuration validated for container builds. 
