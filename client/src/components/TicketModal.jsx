import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config/api';

const VALID_ZONES = ['north', 'south', 'east', 'west'];

const TicketModal = ({ isOpen, onClose, onScanComplete, onScanStart }) => {
  const fileInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setErrorMsg('');
    onScanStart();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch(`${API_URL}/api/vision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: reader.result.split(',')[1],
            mimeType: file.type,
            prompt: "Extract the section number from this ticket image. Return strictly one of these exact words depending on the section: 'north' (100-110), 'east' (111-120), 'south' (121-130), 'west' (131-140). Reply with ONLY that one word in lowercase, no punctuation or extra text."
          }),
          signal: controller.signal,
        });
        const data = await response.json();
        const reply = data.reply ? data.reply.trim().toLowerCase() : '';
        
        setIsScanning(false);
        onClose();
        
        if (VALID_ZONES.includes(reply)) {
          onScanComplete(reply);
        } else {
          onScanComplete(null);
          setErrorMsg("Could not identify a valid stadium section on this ticket.");
        }
      } catch (err) {
        setIsScanning(false);
        onScanComplete(null);
        setErrorMsg(err.name === 'AbortError' ? "Scan timed out. Please try again." : "Ticket scanner failed. Try again.");
      } finally {
        clearTimeout(timeout);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="glass-panel p-8 rounded-2xl w-[400px] max-w-[90vw] hud-border-cyan relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="headline text-[16px] font-bold tracking-[0.2em] text-primary uppercase flex items-center gap-2">
                 <span className="material-symbols-outlined">qr_code_scanner</span>
                 Ticket Scanner
              </h2>
              <button onClick={onClose} className="text-on-surface-variant hover:text-white" disabled={isScanning}>
                 <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="relative z-10 space-y-6 flex flex-col items-center">
               <div className="w-32 h-32 rounded-xl border-2 border-dashed border-primary/50 flex flex-col items-center justify-center p-4 bg-primary/5 text-center transition-all hover:bg-primary/10">
                  {isScanning ? (
                    <>
                      <span className="material-symbols-outlined text-[32px] text-primary animate-pulse mb-2">document_scanner</span>
                      <span className="text-[10px] text-primary uppercase tracking-widest font-bold">Scanning...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[32px] text-primary-dim mb-2">confirmation_number</span>
                      <span className="text-[10px] text-on-surface uppercase tracking-widest font-bold">Upload Pass</span>
                    </>
                  )}
               </div>

               <p className="text-[12px] text-on-surface-variant text-center max-w-[280px]">
                 Upload a photo of your ticket to automatically route you to your allocated stadium section.
               </p>

               {errorMsg && (
                 <p className="text-[11px] text-error text-center font-bold">{errorMsg}</p>
               )}

               <input 
                 type="file" 
                 accept="image/*" 
                 ref={fileInputRef} 
                 style={{ display: 'none' }} 
                 onChange={handleFileUpload}
                 disabled={isScanning}
               />

               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={isScanning}
                 className="w-full py-3 bg-gradient-to-r from-primary to-primary-dim text-on-primary font-bold text-[12px] tracking-widest rounded uppercase hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)] disabled:opacity-50"
               >
                  {isScanning ? 'Processing...' : 'Select Ticket Image'}
               </button>
            </div>
            
            {isScanning && <div className="scanning-line z-0 opacity-50"></div>}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent z-0 pointer-events-none"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TicketModal;
