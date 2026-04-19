import React, { useState } from 'react';
import './App.css';
import StadiumMap from './components/Heatmap/StadiumMap';
import Chatbot from './components/Chat/Chatbot';
import LiveAnnouncer from './components/Emergency/LiveAnnouncer';
import QueueTracker from './components/Queue/QueueTracker';
import SeatUpgrade from './components/Revenue/SeatUpgrade';
import TicketModal from './components/TicketModal';
import { Activity, Users, MessageCircle, Navigation, HelpCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import * as ReactJoyride from 'react-joyride';
const Joyride = ReactJoyride.default || ReactJoyride.Joyride;
const STATUS = ReactJoyride.STATUS;
import WelcomeModal from './components/WelcomeModal';
import ProfileModal from './components/ProfileModal';

function App() {
  const [mode, setMode] = useState('density'); // 'density' or 'hype'
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [highlightZone, setHighlightZone] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [scannedTickets, setScannedTickets] = useState([]);

  const steps = [
    {
      target: '.tour-step-1',
      content: 'Welcome to VenueFlow AI! Toggle between Heat Map (crowd density) and Hype Zone (noise levels) to find the best spots in the stadium.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-2',
      content: 'Watch the stadium pulse in real-time as the game progresses!',
    },
    {
      target: '.tour-step-3',
      content: 'Skip the lines! See live wait times for bathrooms and concessions near you.',
    },
    {
      target: '.tour-step-4',
      content: 'Need help? Snap a photo of your ticket to find your seat, or ask our AI Concierge for the best indoor walking routes.',
    }
  ];

  const triggerPostGame = () => {
    const socket = io('http://localhost:3001', { 
      reconnectionAttempts: 3, 
      timeout: 5000 
    });
    socket.emit('trigger-game-over');
    socket.disconnect();
  };

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <div className="hud-scan" />
      {showWelcome && (
        <WelcomeModal 
          onStartTour={() => {
            setShowWelcome(false);
            setRunTour(true);
          }}
          onSkip={() => setShowWelcome(false)}
        />
      )}
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: 'var(--primary)',
            backgroundColor: 'var(--bg-card)',
            textColor: '#fff',
            overlayColor: 'rgba(0, 0, 0, 0.8)',
            arrowColor: 'var(--bg-card)',
          },
          tooltip: {
            border: '1px solid var(--primary)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)'
          }
        }}
      />
      
      {/* Top Navigation Anchor */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#0e0e14] to-transparent pointer-events-none">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1600px] mx-auto pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00f2ff] text-[24px] scale-95">blur_on</span>
            <span className="font-['Space_Grotesk'] font-black italic tracking-tighter text-[#00f2ff] text-[20px]">VENUEFLOW AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button className="font-['Space_Grotesk'] font-bold tracking-widest text-[14px] text-[#00f2ff] hover:text-[#00f2ff] transition-colors uppercase">DASHBOARD</button>
            <button className="font-['Space_Grotesk'] font-bold tracking-widest text-[14px] text-[#f6f2fc]/60 hover:text-[#00f2ff] transition-colors uppercase" onClick={triggerPostGame}>POST-GAME ROUTER</button>
            <button className="font-['Space_Grotesk'] font-bold tracking-widest text-[14px] text-[#f6f2fc]/60 hover:text-[#00f2ff] transition-colors uppercase tour-step-1" onClick={() => setMode(mode === 'density' ? 'hype' : 'density')}>TOGGLE {mode.toUpperCase()}</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setRunTour(true)} className="text-[#00f2ff]">
              <HelpCircle size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-24 pb-32 px-4 md:px-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-6 relative">
        <SeatUpgrade />
        
        {/* Left Column: HUD Widgets */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6 relative z-10 tour-step-3">
          <QueueTracker />
          <LiveAnnouncer />
        </aside>

        {/* Center Column: Stadium Heatmap */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6 relative z-10 tour-step-2">
           <StadiumMap mode={mode} highlightZone={highlightZone} />
        </div>

        {/* Right Column: AI Concierge */}
        <aside id="chatbot-section" className="col-span-12 lg:col-span-3 flex flex-col gap-6 relative z-10 tour-step-4">
           <Chatbot />
        </aside>
      </main>

      {/* Bottom Navigation Shell */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 px-4 bg-[#25252e]/60 backdrop-blur-2xl rounded-2xl mx-auto mb-6 w-[92%] max-w-lg border border-[#48474f]/20 shadow-[0px_24px_48px_-12px_rgba(153,247,255,0.15)]">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center justify-center gap-1 group text-[#00f2ff] drop-shadow-[0_0_8px_rgba(0,242,255,0.8)] scale-110 h-full px-4 hover:opacity-80 transition-all">
          <span className="material-symbols-outlined">dashboard</span>
        </button>
        <button 
          onClick={() => setMode(mode === 'density' ? 'hype' : 'density')}
          className="flex flex-col items-center justify-center gap-1 group text-[#f6f2fc]/40 hover:bg-[#f6f2fc]/5 hover:text-[#00f2ff] h-full px-4 transition-all">
          <span className="material-symbols-outlined">query_stats</span>
        </button>
        <button 
          onClick={() => {
            const chatObj = document.getElementById('chatbot-section');
            if(chatObj) chatObj.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center gap-1 group text-[#f6f2fc]/40 hover:bg-[#f6f2fc]/5 hover:text-[#00f2ff] h-full px-4 transition-all">
          <span className="material-symbols-outlined">smart_toy</span>
        </button>
        <button 
          onClick={() => setIsTicketModalOpen(true)}
          className="flex flex-col items-center justify-center gap-1 group text-[#f6f2fc]/40 hover:bg-[#f6f2fc]/5 hover:text-[#00f2ff] h-full px-4 transition-all">
          <span className="material-symbols-outlined">confirmation_number</span>
        </button>
        <button 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex flex-col items-center justify-center gap-1 group text-[#f6f2fc]/40 hover:bg-[#f6f2fc]/5 hover:text-[#00f2ff] h-full px-4 transition-all">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </nav>

      {/* Global AR Texture Overlays */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      <div className="fixed inset-0 pointer-events-none z-[101] bg-gradient-to-tr from-primary/5 via-transparent to-secondary/5"></div>
      
      <TicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
        onScanStart={() => setHighlightZone('loading')}
        onScanComplete={(zone) => {
          setHighlightZone(zone);
          if (zone && zone !== 'loading') {
            setScannedTickets(prev => [...prev, { section: zone.toUpperCase(), row: '12' }]);
            setTimeout(() => setHighlightZone(null), 10000);
          }
        }}
      />

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userName="BISHAL_AI_PRO"
        tickets={scannedTickets}
      />
    </div>
  );
}

export default App;
