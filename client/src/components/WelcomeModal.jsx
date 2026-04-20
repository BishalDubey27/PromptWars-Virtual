import { motion } from 'framer-motion';
import { Map, Zap, Target } from 'lucide-react';

const WelcomeModal = ({ onStartTour, onSkip }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{
          background: 'rgba(11, 19, 43, 0.7)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 0 40px rgba(0, 240, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          VenueFlow AI
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '30px', lineHeight: '1.6' }}>
          Your ultimate smart stadium companion. Navigate massive crowds, avoid long lines, and get real-time intelligence tailored to your seat.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '40px', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ padding: '10px', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
              <Target size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'white' }}>Find Your Seat instantly</h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Snap a photo of your ticket.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ padding: '10px', background: 'rgba(255, 0, 127, 0.1)', borderRadius: '12px', color: 'var(--secondary)' }}>
              <Map size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'white' }}>Live Crowd Heatmaps</h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>See real-time density in the stadium.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', color: '#22c55e' }}>
              <Zap size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'white' }}>AI Concierge</h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ask the AI anything via voice or text.</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button 
            onClick={onStartTour}
            className="btn-primary"
            style={{ 
              padding: '16px 32px', 
              fontSize: '1.1rem', 
              background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
              border: 'none',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
            }}
          >
            Start Interactive Tour
          </button>
          <button 
            onClick={onSkip}
            className="btn-primary"
            style={{ 
              padding: '16px 32px', 
              fontSize: '1.1rem', 
              background: 'transparent',
              border: '1px solid var(--text-muted)',
              color: 'var(--text-light)'
            }}
          >
            Skip
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeModal;
