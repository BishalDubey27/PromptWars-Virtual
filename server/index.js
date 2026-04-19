const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security: Add Helmet for HTTP headers (allow cross-origin for our React frontend)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Security: Restrict CORS to specific frontend origins (no wildcard *)
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:80'];
app.use(cors({ origin: allowedOrigins }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
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

// Start Simulation Engine
const startSimulation = () => {
  setInterval(() => {
    // 1. Update Density & Hype
    const updateLevel = (current) => {
      const drift = Math.random() > 0.5 ? 1 : -1;
      let newLevel = current + drift;
      return Math.max(1, Math.min(3, newLevel));
    };

    const zoneNames = Object.keys(stadiumZones);
    const targetZone = zoneNames[Math.floor(Math.random() * zoneNames.length)];
    const targetAttr = Math.random() > 0.5 ? 'density' : 'hype';

    stadiumZones[targetZone][targetAttr] = updateLevel(stadiumZones[targetZone][targetAttr]);

    // 2. Update Queue Times
    const queueNames = Object.keys(queueTimes);
    const targetQueue = queueNames[Math.floor(Math.random() * queueNames.length)];
    const queueDrift = Math.random() > 0.5 ? 1 : -1;
    let newQTime = queueTimes[targetQueue] + queueDrift;
    queueTimes[targetQueue] = Math.max(0, Math.min(30, newQTime));

    // Broadcast the new state to all connected clients
    io.emit('stadium-update', stadiumZones);
    io.emit('queue-update', queueTimes);
    
    // Broadcast escape staggers if game over
    if (postGameOver) {
      io.emit('escape-router', {
          "north": "Clear to exit",
          "south": "Wait 5 minutes",
          "east": "Wait 2 minutes",
          "west": "Clear to exit"
      });
    }

    // 3. Random Dynamic Seat Upgrade (Subtle demo frequency: ~1% chance every 10 sec) 
    if (Math.random() < 0.01 && !postGameOver) {
        const upgrades = [
            { row: "VIP Row 2", perks: "Free Drink + Field Access", price: "$45" },
            { row: "Club Level Suite C", perks: "Catered Buffet + Lounge", price: "$99" },
            { row: "Lower Bowl Sect 110", perks: "Closer to the action!", price: "$20" }
        ];
        const selected = upgrades[Math.floor(Math.random() * upgrades.length)];
        io.emit('seat-upgrade', selected);
    }

  }, 10000); // Only check every 10 seconds for upgrades now
};

startSimulation();

io.on('connection', (socket) => {
  console.log('A fan connected:', socket.id);
  
  // Send current state immediately upon connection
  socket.emit('stadium-update', stadiumZones);
  socket.emit('queue-update', queueTimes);

  // Trigger game over manually for testing
  socket.on('trigger-game-over', () => {
      postGameOver = !postGameOver;
      console.log('Post Game Escape Triggered:', postGameOver);
  });

  socket.on('disconnect', () => {
    console.log('Fan disconnected:', socket.id);
  });
});

// Security: API Rate Limiter to prevent Denial of Wallet on expensive AI calls
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { reply: "Whoa there, fan! You're talking to the AI too fast. Let's catch our breath." }
});

const { handleChat, handleVision } = require('./gemini');

// Parse JSON bodies (strictly limit payload size)
app.use(express.json({ limit: '5mb' }));

// Gemini endpoints secured with rate limit
app.post('/api/chat', apiLimiter, (req, res) => handleChat(req, res, stadiumZones));
app.post('/api/vision', apiLimiter, handleVision);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`VenueFlow AI Server running on port ${PORT}`);
});
