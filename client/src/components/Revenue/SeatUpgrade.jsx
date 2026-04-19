import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X, Check } from 'lucide-react';

const SeatUpgrade = () => {
  const [upgrade, setUpgrade] = useState(null);

  useEffect(() => {
    // Connect to Node backend securely
    const socket = io('http://localhost:3001', {
      reconnectionAttempts: 5,
      timeout: 5000
    });

    socket.on('seat-upgrade', (data) => {
      // Only show one upgrade at a time, ignore new ones if one is active
      setUpgrade(prev => prev ? prev : data);
    });

    return () => socket.disconnect();
  }, []);

  if (!upgrade) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
        className="fixed top-24 right-8 z-[200] overflow-hidden p-6 rounded-xl bg-gradient-to-br from-secondary-container/20 to-surface-container hud-border-magenta shadow-[0_0_30px_rgba(255,89,227,0.1)] w-[320px]"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary animate-pulse">stars</span>
                <h2 className="headline text-[12px] font-bold tracking-[0.2em] text-secondary uppercase">Priority Upgrade</h2>
             </div>
             <button onClick={() => setUpgrade(null)} className="text-on-surface-variant hover:text-white">
                <span className="material-symbols-outlined text-[16px]">close</span>
             </button>
          </div>
          <p className="text-[14px] text-on-surface-variant leading-relaxed mb-6">
            <span className="text-white font-bold">{upgrade.row}</span>: {upgrade.perks}
          </p>
          <div className="flex justify-between items-center mt-2">
             <div className="text-[18px] font-bold text-secondary">{upgrade.price}</div>
             <button onClick={() => setUpgrade(null)} className="py-2 px-6 bg-gradient-to-r from-secondary to-secondary-dim text-on-secondary font-bold text-[12px] tracking-widest rounded uppercase hover:opacity-90 transition-all neon-glow-magenta">
                Claim Seat
            </button>
          </div>
        </div>
        <div className="scanning-line opacity-20"></div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SeatUpgrade;
