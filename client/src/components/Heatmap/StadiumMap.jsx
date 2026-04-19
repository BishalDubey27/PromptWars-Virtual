import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';

const getDensityColor = (level) => {
  if (level === 1) return 'var(--density-low)';
  if (level === 2) return 'var(--density-med)';
  return 'var(--density-high)';
};

const getHypeColor = (level) => {
  if (level === 1) return 'var(--hype-low)';
  if (level === 2) return 'var(--hype-med)';
  return 'var(--hype-high)';
};

const StadiumMap = ({ mode, highlightZone }) => {
  // Mock fallback if server is down, but we will rely on socket data
  const [zones, setZones] = useState({
    north: { density: 1, hype: 1 },
    south: { density: 1, hype: 1 },
    east: { density: 1, hype: 1 },
    west: { density: 1, hype: 1 },
  });

  useEffect(() => {
    // Connect to Node backend securely
    const socket = io('http://localhost:3001', {
      reconnectionAttempts: 5,
      timeout: 5000
    });

    socket.on('stadium-update', (data) => {
      setZones(data);
    });

    return () => socket.disconnect();
  }, []);

  const getColor = (zoneData, zoneName) => {
    if (highlightZone === zoneName) return 'rgba(251, 191, 36, 0.9)'; // Bright Gold for highlighted
    if (highlightZone && highlightZone !== zoneName) return 'rgba(0, 0, 0, 0.5)'; // Dim others
    return mode === 'density' ? getDensityColor(zoneData.density) : getHypeColor(zoneData.hype);
  };

  const getStroke = (zoneName) => {
      return highlightZone === zoneName ? '#ffffff' : 'rgba(255,255,255,0.2)';
  };

  const getStrokeWidth = (zoneName) => {
      return highlightZone === zoneName ? '4' : '2';
  };

  return (
    <section className="glass-panel flex-1 rounded-2xl relative overflow-hidden group h-full">
      <div className="absolute inset-0 z-0">
        <img className="w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="aerial top-down view of a futuristic sports stadium at night" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEq1tcJyYcfKlW4qzK7u8XKJRZIyUZQ5tnGRzwG_JV1JS2TQoFk95VNWMNk04CXio1xYmZCmdhcPD23DLcdudfq_Kn6hbtpwwgWJIFPqY1RareNFaTRtcbkzmvqJIN6L92RdSNElmmgul68G1_H9jM6jde44IQikStfDQyLFPJCMXA8CIAk9ZdwSXP5Pnd-3JcNnS2J76dexT85pfMxm5H5WNW4q1_3kLc3jjfhi1Cs_UJ8DYBwL6Dlx7H1KptMYgIV7neuhC8PO8k"/>
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
      </div>
      
      {/* Overlay UI Elements for Heatmap */}
      <div className="relative z-10 p-8 flex flex-col h-full pointer-events-none">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="headline text-[32px] font-black tracking-tighter text-on-surface mb-2 pointer-events-auto">
               {highlightZone ? `ZONE ${highlightZone.toUpperCase()}` : 'OVERVIEW'}
            </h1>
            <div className="flex items-center gap-2 text-primary-dim">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <span className="text-[12px] font-bold tracking-widest uppercase">Live Crowd Density: Variable</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-bold text-primary tracking-widest uppercase pointer-events-auto">AR Active</div>
            <div className="text-right pointer-events-auto">
              <div className="text-[12px] text-on-surface-variant">Avg Temp</div>
              <div className="headline font-bold text-[20px] text-on-surface">68°F</div>
            </div>
          </div>
        </div>

        {/* The Map */}
        <div className="flex-1 flex justify-center items-center relative pointer-events-auto my-4 w-[120%] -ml-[10%]">
          <svg viewBox="0 0 800 600" className="w-[80%] max-h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            {/* Outer Stadium Track Background */}
            <ellipse cx="400" cy="300" rx="350" ry="250" fill="transparent" stroke="var(--primary)" strokeWidth="1" strokeDasharray="10 5" opacity="0.3" />
            
            {/* North Zone */}
            <motion.path 
              d="M 150 150 C 250 50, 550 50, 650 150 L 550 200 C 450 150, 350 150, 250 200 Z"
              fill={getColor(zones.north, 'north')}
              stroke={getStroke('north')}
              strokeWidth={getStrokeWidth('north')}
              animate={{ fill: getColor(zones.north, 'north') }}
              transition={{ duration: 1 }}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => console.log('North Section Clicked')}
            />
            <text x="400" y="110" fill="white" textAnchor="middle" fontWeight="bold" opacity="0.8">NORTH</text>

            {/* South Zone */}
            <motion.path 
              d="M 150 450 C 250 550, 550 550, 650 450 L 550 400 C 450 450, 350 450, 250 400 Z"
              fill={getColor(zones.south, 'south')}
              stroke={getStroke('south')}
              strokeWidth={getStrokeWidth('south')}
              animate={{ fill: getColor(zones.south, 'south') }}
              transition={{ duration: 1 }}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => console.log('South Section Clicked')}
            />
            <text x="400" y="500" fill="white" textAnchor="middle" fontWeight="bold" opacity="0.8">SOUTH</text>

            {/* West Zone */}
            <motion.path 
              d="M 150 150 C 50 250, 50 350, 150 450 L 250 400 C 180 320, 180 280, 250 200 Z"
              fill={getColor(zones.west, 'west')}
              stroke={getStroke('west')}
              strokeWidth={getStrokeWidth('west')}
              animate={{ fill: getColor(zones.west, 'west') }}
              transition={{ duration: 1 }}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => console.log('West Section Clicked')}
            />
            <text x="120" y="305" fill="white" textAnchor="middle" fontWeight="bold" opacity="0.8" transform="rotate(-90 120,305)">WEST</text>

            {/* East Zone */}
            <motion.path 
              d="M 650 150 C 750 250, 750 350, 650 450 L 550 400 C 620 320, 620 280, 550 200 Z"
              fill={getColor(zones.east, 'east')}
              stroke={getStroke('east')}
              strokeWidth={getStrokeWidth('east')}
              animate={{ fill: getColor(zones.east, 'east') }}
              transition={{ duration: 1 }}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => console.log('East Section Clicked')}
            />
            <text x="680" y="305" fill="white" textAnchor="middle" fontWeight="bold" opacity="0.8" transform="rotate(90 680,305)">EAST</text>

            {/* Inner Field */}
            <rect x="250" y="200" width="300" height="200" rx="20" fill="rgba(0,0,0,0.5)" stroke="white" strokeWidth="2" opacity="0.8" />
            
            {/* Field Markings */}
            <line x1="400" y1="200" x2="400" y2="400" stroke="white" strokeWidth="2" opacity="0.5" />
            <circle cx="400" cy="300" r="40" fill="none" stroke="white" strokeWidth="2" opacity="0.5" />
          </svg>
        </div>

        {/* HUD Data Points */}
        <div className="grid grid-cols-2 gap-4 pointer-events-auto">
          <div className="p-4 bg-surface-container-lowest/60 backdrop-blur-md rounded-lg border border-outline-variant/20">
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Fan Engagement</div>
            <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary shadow-[0_0_8px_#99f7ff]" initial={{ width: "0%" }} animate={{ width: "75%" }} />
            </div>
          </div>
          <div className="p-4 bg-surface-container-lowest/60 backdrop-blur-md rounded-lg border border-outline-variant/20">
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Noise Levels</div>
            <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
              <motion.div className="h-full bg-secondary shadow-[0_0_8px_#ff59e3]" initial={{ width: "0%" }} animate={{ width: "50%" }} />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-auto flex justify-between items-end pointer-events-auto">
          <div className="glass-panel px-4 py-3 border border-outline-variant/10 rounded-xl flex gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">
                {mode === 'density' ? 'Density Scale' : 'Hype Scale'}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mode === 'density' ? 'var(--density-low)' : 'var(--hype-low)' }}></div>
                  <span className="text-[11px] font-bold text-on-surface lowercase">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mode === 'density' ? 'var(--density-med)' : 'var(--hype-med)' }}></div>
                  <span className="text-[11px] font-bold text-on-surface lowercase">Med</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(153,247,255,0.4)]" style={{ backgroundColor: mode === 'density' ? 'var(--density-high)' : 'var(--hype-high)' }}></div>
                  <span className="text-[11px] font-bold text-on-surface lowercase">High</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
             <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
             </div>
             <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">layers</span>
             </div>
          </div>
        </div>
      </div>

      <div className="scanning-line"></div>
    </section>
  );
};

export default StadiumMap;
