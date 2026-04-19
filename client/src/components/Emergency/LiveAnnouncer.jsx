import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Globe, Volume2 } from 'lucide-react';

const mockAnnouncements = [
  "Welcome to the VenueFlow Stadium! Game starts in 10 minutes.",
  "Attention: The North Exit is currently congested. Please use the East Exit.",
  "Halftime show will begin in 5 minutes. Enjoy the interactive trivia!",
  "Lost child found near Section 112. Please contact security."
];

const mockTranslations = {
  "Welcome to the VenueFlow Stadium! Game starts in 10 minutes.": "¡Bienvenido al Estadio VenueFlow! El juego comienza en 10 minutos.",
  "Attention: The North Exit is currently congested. Please use the East Exit.": "Atención: La salida norte está congestionada. Use la salida este.",
  "Halftime show will begin in 5 minutes. Enjoy the interactive trivia!": "El espectáculo de medio tiempo comienza en 5 minutos. ¡Disfrute la trivia!",
  "Lost child found near Section 112. Please contact security.": "Niño perdido encontrado cerca de la sección 112. Contacte a seguridad."
};

const LiveAnnouncer = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translated, setTranslated] = useState(false);
  const [announcement, setAnnouncement] = useState(mockAnnouncements[0]);

  // Rotate announcements every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTranslated(false);
      const nextIndex = (currentIndex + 1) % mockAnnouncements.length;
      setCurrentIndex(nextIndex);
      setAnnouncement(mockAnnouncements[nextIndex]);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleTranslate = () => {
    setTranslated(true);
    setAnnouncement(mockTranslations[mockAnnouncements[currentIndex]]);
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(announcement);
    if (translated) {
        // Mock a Spanish voice if available, otherwise default
        utterance.lang = 'es-ES';
    } else {
        utterance.lang = 'en-US';
    }
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="glass-panel p-6 rounded-xl hud-border-magenta flex flex-col gap-4 mt-auto">
      <div className="flex justify-between items-center bg-surface-container-low/50 -mx-6 -mt-6 p-4 rounded-t-xl mb-2">
        <h3 className="headline text-[12px] font-bold tracking-[0.2em] text-on-surface uppercase flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-dim">campaign</span> Live PA Announcer
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handleTranslate} 
            disabled={translated}
            className={`flex items-center gap-1 text-[10px] tracking-widest uppercase font-bold ${translated ? 'text-primary' : 'text-on-surface-variant hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[14px]">translate</span> Translate
          </button>
          <button 
            onClick={handleSpeak}
            className="text-on-surface-variant hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
          </button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={announcement}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="p-4 bg-surface-container-low rounded-lg text-[14px] italic border-l-2 border-primary text-on-surface-variant"
        >
          "{announcement}"
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default LiveAnnouncer;
