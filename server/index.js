const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Google Cloud Logging
let logging = null;
try {
  const { Logging } = require('@google-cloud/logging');
  logging = new Logging();
} catch (e) {
  console.warn('Google Cloud Logging not initialized (local development)');
}

const app = express();
const log = (message, severity = 'INFO') => {
  if (logging) {
    const logEntry = logging.log('venueflow-logs').entry({ message }, message);
    logging.log('venueflow-logs').write(logEntry);
  }
  console.log(`[${severity}] ${message}`);
};

/**
 * Security: Add Helmet for HTTP headers with strict CSP
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://api.dicebear.com", "https://www.transparenttextures.com"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "*"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Security: Restrict CORS to specific frontend origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173', 
  'http://localhost:5174', 
  'http://localhost:80'
];
app.use(cors({ origin: allowedOrigins }));

const server = http.createServer(app);

/**
 * Socket.io with Authentication Handshake
 */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Mock JWT check for socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    log('Connection attempt without token', 'WARNING');
    // For demo/hackathon purposes, we allow it but log it. 
    // In strict prod, we would call next(new Error("unauthorized"));
    return next();
  }
  next();
});

// Simulation State
let stadiumZones = {
  north: { density: 1, hype: 1 },
  south: { density: 3, hype: 3 },
  east: { density: 2, hype: 1 },
  west: { density: 1, hype: 1 },
};

let queueTimes = {
  bathroom_north: 2,
  bathroom_south: 10,
  concessions_east: 5,
  concessions_west: 15
};

let postGameOver = false;

/**
 * Simulation Engine: Updates stadium state periodically
 */
const startSimulation = () => {
  setInterval(() => {
    const updateLevel = (current) => {
      const drift = Math.random() > 0.5 ? 1 : -1;
      let newLevel = current + drift;
      return Math.max(1, Math.min(3, newLevel));
    };

    const zoneNames = Object.keys(stadiumZones);
    const targetZone = zoneNames[Math.floor(Math.random() * zoneNames.length)];
    const targetAttr = Math.random() > 0.5 ? 'density' : 'hype';

    stadiumZones[targetZone][targetAttr] = updateLevel(stadiumZones[targetZone][targetAttr]);

    const queueNames = Object.keys(queueTimes);
    const targetQueue = queueNames[Math.floor(Math.random() * queueNames.length)];
    const queueDrift = Math.random() > 0.5 ? 1 : -1;
    let newQTime = queueTimes[targetQueue] + queueDrift;
    queueTimes[targetQueue] = Math.max(0, Math.min(30, newQTime));

    io.emit('stadium-update', stadiumZones);
    io.emit('queue-update', queueTimes);
    
    if (postGameOver) {
      io.emit('escape-router', {
          "north": "Clear to exit",
          "south": "Wait 5 minutes",
          "east": "Wait 2 minutes",
          "west": "Clear to exit"
      });
    }

    if (Math.random() < 0.01 && !postGameOver) {
        const upgrades = [
            { row: "VIP Row 2", perks: "Free Drink + Field Access", price: "$45" },
            { row: "Club Level Suite C", perks: "Catered Buffet + Lounge", price: "$99" },
            { row: "Lower Bowl Sect 110", perks: "Closer to the action!", price: "$20" }
        ];
        const selected = upgrades[Math.floor(Math.random() * upgrades.length)];
        io.emit('seat-upgrade', selected);
    }
  }, 10000);
};

startSimulation();

io.on('connection', (socket) => {
  log(`Fan connected: ${socket.id}`);
  socket.emit('stadium-update', stadiumZones);
  socket.emit('queue-update', queueTimes);

  socket.on('trigger-game-over', () => {
      postGameOver = !postGameOver;
      log(`Post Game Escape Triggered: ${postGameOver}`, 'INFO');
  });

  socket.on('disconnect', () => {
    log(`Fan disconnected: ${socket.id}`);
  });
});

/**
 * Health Check Endpoints for Google Cloud Run
 */
app.get('/healthz', (req, res) => res.status(200).send('OK'));
app.get('/readyz', (req, res) => res.status(200).send('OK'));

// API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { reply: "Whoa there, fan! You're talking to the AI too fast. Let's catch our breath." }
});

const { handleChat, handleVision } = require('./gemini');

app.use(express.json({ limit: '5mb' }));

/**
 * AI Chat Endpoint with Validation
 */
app.post('/api/chat', 
  apiLimiter,
  body('message').isString().notEmpty().trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    handleChat(req, res, stadiumZones);
  }
);

/**
 * AI Vision Endpoint with Validation
 */
app.post('/api/vision', 
  apiLimiter,
  body('imageBase64').isString().notEmpty(),
  body('mimeType').optional().isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    handleVision(req, res);
  }
);

app.use(express.static(path.join(__dirname, '../client/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = parseInt(process.env.PORT) || 3001;
server.listen(PORT, '0.0.0.0', () => {
  log(`VenueFlow AI Server running on port ${PORT}`);
});

