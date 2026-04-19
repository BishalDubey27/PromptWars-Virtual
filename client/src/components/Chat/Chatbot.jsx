import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Camera, Volume2, VolumeX, Loader2 } from 'lucide-react';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your VenueFlow AI. Want to check the bathroom wait times or know what is happening on the field?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speak = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1; // Slightly faster for energy
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await response.json();
      if (!response.ok && !data.reply) {
         const errorMsg = data.error || "Network error. Try again!";
         setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ ${errorMsg}` }]);
         speak("I encountered an error.");
      } else {
         const reply = data.reply || "Sorry, I am out of bounds right now!";
         setMessages(prev => [...prev, { 
            sender: 'ai', 
            text: reply,
            isFallback: data.isFallback 
         }]);
         speak(reply);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: "Error connecting to AI Server. 📡" }]);
    }
    setIsTyping(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessages(prev => [...prev, { sender: 'user', text: "📸 [Sent an image for Snap & Know]" }]);
    setIsTyping(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      // Extract base64
      const base64data = reader.result.split(',')[1];
      
      try {
        const response = await fetch('http://localhost:3001/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64data,
            mimeType: file.type,
            prompt: "Analyze this image. If it is a picture of a stadium ticket, extract the Section and Row, and then provide a friendly, custom 2-sentence wayfinding guide to help the fan navigate precisely to their seat from the main entrance. If it is not a ticket, just describe what is happening in the sports stadium in 2 brief energetic sentences."
          })
        });

        const data = await response.json();
        const reply = data.reply || "Couldn't see that clearly!";
        setMessages(prev => [...prev, { sender: 'ai', text: `📸 Vision Analysis: ${reply}` }]);
        speak(reply);
      } catch (err) {
        setMessages(prev => [...prev, { sender: 'ai', text: "Error uploading image to Vision AI." }]);
      }
      setIsTyping(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="glass-panel flex-1 rounded-xl flex flex-col overflow-hidden hud-border-cyan h-full">
      <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div>
            <h2 className="headline text-[14px] font-bold tracking-widest text-on-surface uppercase">AI Concierge</h2>
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest">Always Listening</span>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setTtsEnabled(!ttsEnabled)} className={ttsEnabled ? 'text-primary' : 'text-on-surface-variant'}>
              <span className="material-symbols-outlined">{ttsEnabled ? 'volume_up' : 'volume_off'}</span>
           </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col gap-1 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`px-4 py-3 rounded-2xl text-[14px] max-w-[85%] ${
                m.sender === 'user' 
                ? 'bg-primary/20 rounded-tr-none text-primary font-medium' 
                : 'bg-surface-container-high rounded-tl-none text-on-surface-variant'
              }`}>
                {m.isFallback && (
                  <div className="flex items-center gap-1 mb-1 opacity-60">
                    <span className="material-symbols-outlined text-[10px]">wifi_off</span>
                    <span className="text-[10px] font-bold tracking-tighter uppercase italic">OFFLINE INTEL</span>
                  </div>
                )}
                {m.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start gap-1">
               <div className="bg-surface-container-high px-4 py-3 rounded-2xl rounded-tl-none text-[14px] max-w-[85%] text-on-surface-variant flex items-center">
                 <Loader2 size={16} className="animate-spin text-primary" />
                 <span className="ml-2 italic text-[12px]">Analyzing...</span>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface-container-low border-t border-outline-variant/10">
        <button 
          onClick={() => fileInputRef.current.click()}
          className="w-full mb-3 flex items-center justify-center gap-2 py-3 bg-surface-container-highest border border-outline-variant/30 rounded-lg hover:bg-surface-bright transition-all group"
        >
           <span className="material-symbols-outlined text-primary-dim text-[14px]">confirmation_number</span>
           <span className="text-[12px] font-bold tracking-widest uppercase text-on-surface">Upload Ticket</span>
        </button>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload}
        />
        <div className="relative">
          <input 
            className="w-full bg-transparent border-0 border-b border-outline-variant py-2 pr-10 text-[14px] focus:ring-0 focus:border-primary placeholder:text-on-surface-variant transition-colors outline-none" 
            placeholder="Ask anything..." 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="absolute right-0 top-1/2 -translate-y-1/2 text-primary hover:text-primary-container">
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Chatbot;
