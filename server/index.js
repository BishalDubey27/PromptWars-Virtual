const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Security: Root-level crash handlers
process.on('uncaughtException', (err) => {
  console.error('CRITICAL ERROR (uncaughtException):', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL ERROR (unhandledRejection):', reason);
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Simple logging utility for production stability
const log = (msg, sev = 'INFO') => console.log(`[${sev}] ${msg}`);

// Security: Helmet for production-grade HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://api.dicebear.com"],
      connectSrc: ["'self'", "wss://*.run.app", "https://*.run.app", "https://generativelanguage.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Stadium State Mock Simulation
const stadiumZones = {
  north: { occupancy: 85, status: 'busy' },
  south: { occupancy: 45, status: 'normal' },
  east: { occupancy: 92, status: 'critical' },
  west: { occupancy: 30, status: 'quiet' }
};

const queueTimes = {
  gateA: 15,
  gateB: 5,
  foodCourt: 25,
  merchTable: 10
};

/**
 * Real-time Simulation Logic
 */
const startSimulation = () => {
  setInterval(() => {
    Object.keys(stadiumZones).forEach(zone => {
      const delta = Math.floor(Math.random() * 5) - 2;
      stadiumZones[zone].occupancy = Math.max(10, Math.min(100, stadiumZones[zone].occupancy + delta));
      stadiumZones[zone].status = stadiumZones[zone].occupancy > 90 ? 'critical' : stadiumZones[zone].occupancy > 70 ? 'busy' : 'normal';
    });
    io.emit('stadium-update', stadiumZones);
  }, 5000);
};

startSimulation();

io.on('connection', (socket) => {
  log(`Fan connected: ${socket.id}`);
  socket.emit('stadium-update', stadiumZones);
  
  socket.on('disconnect', () => {
    log(`Fan disconnected: ${socket.id}`);
  });
});

/**
 * Health Check Endpoints
 */
app.get('/healthz', (req, res) => res.status(200).send('OK'));
app.get('/readyz', (req, res) => res.status(200).send('OK'));

// API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { reply: "Slow down, fan!" }
});

// Import AI Handlers (Using fixed gemini.js)
const { handleChat, handleVision } = require('./gemini');

app.post('/api/chat', 
  apiLimiter,
  body('message').isString().notEmpty().trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    handleChat(req, res);
  }
);

app.post('/api/vision', 
  apiLimiter,
  body('image').notEmpty(),
  (req, res) => {
    handleVision(req, res);
  }
);

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  log(`VenueFlow AI Production Server running on port ${PORT}`);
});
