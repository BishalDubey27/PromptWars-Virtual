require('./instrumentation');
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin');

// GCP Native Utils
const { Logging } = require('@google-cloud/logging');
const { getSecret } = require('./secrets');
const { getAssetUrl } = require('./storage');
const { dispatchStadiumSimulation } = require('./tasks');

if (process.env.NODE_ENV === 'production') {
  admin.initializeApp();
}

const db = admin.apps.length ? admin.firestore() : null;
const logging = process.env.NODE_ENV === 'production' ? new Logging() : null;

const log = (message, severity = 'INFO') => {
  if (logging) {
    const logEntry = logging.log('venueflow-production').entry({ message }, message);
    logging.log('venueflow-production').write(logEntry).catch(console.error);
  }
  console.log(`[${severity}] ${message}`);
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// DEFINTIVE CSP FIX FOR GOOGLE SERVICES
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.socket.io", "https://maps.googleapis.com", "https://*.google.com", "https://*.firebaseapp.com", "https://*.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://api.dicebear.com", "https://*.googleapis.com", "https://*.gstatic.com", "https://storage.googleapis.com", "https://www.transparenttextures.com", "https://*.googleusercontent.com", "https://*.google.com"],
      connectSrc: ["'self'", "wss://*.run.app", "https://*.run.app", "https://*.googleapis.com", "https://*.firebaseio.com", "https://*.firebase.com", "https://*.google.com", "https://*.firebaseapp.com", "ws://localhost:*", "http://localhost:*"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://*.google.com", "https://*.firebaseapp.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let stadiumZones = {
  north: { occupancy: 85, status: 'busy' },
  south: { occupancy: 45, status: 'normal' },
  east: { occupancy: 92, status: 'critical' },
  west: { occupancy: 30, status: 'quiet' }
};

async function syncToFirestore() {
  if (!db) return;
  try {
    await db.collection('stadium').doc('live-state').set({
      zones: stadiumZones,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    log(`Firestore sync failed: ${err.message}`, 'WARNING');
  }
}

setInterval(async () => {
  Object.keys(stadiumZones).forEach(zone => {
    const delta = Math.floor(Math.random() * 5) - 2;
    stadiumZones[zone].occupancy = Math.max(10, Math.min(100, stadiumZones[zone].occupancy + delta));
    stadiumZones[zone].status = stadiumZones[zone].occupancy > 90 ? 'critical' : stadiumZones[zone].occupancy > 70 ? 'busy' : 'normal';
  });
  io.emit('stadium-update', stadiumZones);
  if (process.env.NODE_ENV === 'production') {
    await syncToFirestore();
    await dispatchStadiumSimulation(stadiumZones);
  }
}, 10000);

io.on('connection', (socket) => {
  log(`Fan connected: ${socket.id}`);
  socket.emit('stadium-update', stadiumZones);
});

const { handleChat, handleVision } = require('./gemini');
const apiLimiter = rateLimit({ windowMs: 1*60*1000, max: 30 });

app.post('/api/chat', apiLimiter, (req, res) => handleChat(req, res));
app.post('/api/vision', apiLimiter, (req, res) => handleVision(req, res));
app.post('/api/tasks/simulate', (req, res) => res.status(200).send('Processed'));

app.get('/healthz', (req, res) => res.send('OK'));

// Statics
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA CATCH-ALL (Stable Express 4)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  log(`VenueFlow Graduation Build live on port ${PORT}`);
});
