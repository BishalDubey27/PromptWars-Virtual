import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Clock, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QueueTracker = () => {
  const [queues, setQueues] = useState({
    bathroom_north: 0,
    bathroom_south: 0,
    concessions_east: 0,
    concessions_west: 0
  });

  const [escapeRoutes, setEscapeRoutes] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      reconnectionAttempts: 5,
      timeout: 5000
    });

    socket.on('queue-update', (data) => {
      setQueues(data);
    });

    socket.on('escape-router', (data) => {
      setEscapeRoutes(data);
    });

    return () => socket.disconnect();
  }, []);

  const getUrgencyClass = (time) => {
    if (time < 5) return 'text-primary';
    if (time < 12) return 'text-yellow-400';
    return 'text-error';
  };

  return (
    <section className="glass-panel p-6 rounded-xl hud-border-cyan flex-col gap-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="headline text-[12px] font-bold tracking-[0.2em] text-primary uppercase">Live Queue Monitor</h2>
        <div className="pulse-ring"></div>
      </div>
      <div className="space-y-4">
        <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between group hover:bg-surface-container-high transition-all">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-dim">wc</span>
            <span className="font-medium text-[14px]">North Restroom</span>
          </div>
          <span className={`headline font-bold ${getUrgencyClass(queues.bathroom_north)}`}>{queues.bathroom_north}m</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between group hover:bg-surface-container-high transition-all">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-primary-dim">wc</span>
             <span className="font-medium text-[14px]">South Restroom</span>
          </div>
           <span className={`headline font-bold ${getUrgencyClass(queues.bathroom_south)}`}>{queues.bathroom_south}m</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between group hover:bg-surface-container-high transition-all">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-primary-dim">fastfood</span>
             <span className="font-medium text-[14px]">East Concessions</span>
          </div>
           <span className={`headline font-bold ${getUrgencyClass(queues.concessions_east)}`}>{queues.concessions_east}m</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between group hover:bg-surface-container-high transition-all">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-dim">restaurant</span>
            <span className="font-medium text-[14px]">West Concessions</span>
          </div>
          <span className={`headline font-bold ${getUrgencyClass(queues.concessions_west)}`}>{queues.concessions_west}m</span>
        </div>
      </div>

      <AnimatePresence>
        {escapeRoutes && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <h3 className="text-[14px] text-primary flex items-center gap-2 mb-3">
               <span className="material-symbols-outlined">directions_run</span> Post-Game Escape Route
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(escapeRoutes).map(([section, instruction]) => (
                <div key={section} className="bg-primary/10 border border-primary/20 p-2 rounded text-center">
                  <div className="text-[10px] uppercase text-on-surface-variant mb-1">{section}</div>
                  <div className="text-[12px] font-bold text-on-surface">{instruction}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default QueueTracker;
