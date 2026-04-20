import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Wallet, Ticket, Trophy, Zap, Share2 } from 'lucide-react';

import { auth, loginWithGoogle } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const ProfileModal = ({ isOpen, onClose, userName = "GUEST_FAN", tickets = [] }) => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const displayName = user ? user.displayName : userName;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg glass-panel overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <ShieldCheck className="text-primary w-6 h-6" />
              </div>
              <div>
                <h2 className="headline text-[18px] font-black tracking-widest text-on-surface uppercase italic">Neural ID</h2>
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest animate-pulse">
                  {user ? 'Verified Session' : 'Encrypted Guest'}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="text-on-surface-variant" size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Neural ID Card */}
            <motion.div 
              whileHover={{ scale: 1.02, rotateY: 5 }}
              className="relative aspect-[1.6/1] w-full rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(153,247,255,0.15)] group"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a24] to-[#0e0e14] border border-white/10"></div>
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(var(--primary) 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
               
               <div className="relative p-6 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-lg bg-surface-container-highest border border-primary/20 overflow-hidden relative">
                          <img src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`} alt="avatar" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-on-surface tracking-tighter uppercase">{displayName}</h3>
                          <div className="flex items-center gap-2">
                             <div className="px-2 py-0.5 bg-primary/10 rounded text-[9px] font-black text-primary tracking-widest border border-primary/20">
                               {user ? 'AUTHENTICATED' : 'ANONYMOUS'}
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="bg-white p-1 rounded-sm opacity-80 group-hover:opacity-100 transition-opacity">
                       {/* Mock QR Code */}
                       <div className="w-12 h-12 bg-black flex items-center justify-center p-1">
                          <div className="w-full h-full border-2 border-white grid grid-cols-3 gap-1">
                             {[...Array(9)].map((_, i) => <div key={i} className={`bg-white ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>)}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                     <p className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase opacity-60">VenueFlow Universal Access</p>
                     <div className="flex justify-between items-end">
                        <div className="font-mono text-primary/80 text-[12px] tracking-[0.2em]">0X-77A-99B-VF</div>
                        <Zap className="text-secondary w-5 h-5 animate-pulse" />
                     </div>
                  </div>
               </div>

               {/* Glitch Overlay */}
               <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-10 bg-primary animate-pulse"></div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
               <div className="glass-panel p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
                  <Trophy className="text-primary w-5 h-5 mb-1" />
                  <span className="text-[18px] font-black">2,450</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-tighter">Hype Points</span>
               </div>
               <div className="glass-panel p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
                  <Wallet className="text-secondary w-5 h-5 mb-1" />
                  <span className="text-[18px] font-black">$124</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-tighter">Credits</span>
               </div>
               <div className="glass-panel p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
                  <Zap className="text-primary-dim w-5 h-5 mb-1" />
                  <span className="text-[18px] font-black">12</span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-tighter">Day Streak</span>
               </div>
            </div>

            {/* Digital Tickets */}
            <div className="space-y-3">
               <h3 className="text-[12px] font-black tracking-widest text-[#99f7ff] uppercase">Active Access Passes</h3>
               {tickets.length > 0 ? (
                 <div className="space-y-2">
                   {tickets.map((t, i) => (
                      <div key={i} className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-primary">
                         <div className="flex items-center gap-4">
                            <Ticket className="text-primary-dim" />
                            <div>
                               <div className="text-[14px] font-bold">Stadium Entry: VIP</div>
                               <div className="text-[11px] text-on-surface-variant">Row {t.row || '--'} | Section {t.section || '--'}</div>
                            </div>
                         </div>
                         <Share2 className="text-on-surface-variant cursor-pointer hover:text-white" size={18} />
                      </div>
                   ))}
                 </div>
               ) : (
                 <div className="glass-panel p-6 border-dashed border-white/10 flex flex-col items-center text-center">
                    <p className="text-[12px] text-on-surface-variant italic mb-3">No active tickets found in this session.</p>
                    <button className="text-[10px] font-bold text-primary border border-primary/30 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-primary/10 transition-colors">
                       Scan Physical Ticket
                    </button>
                 </div>
               )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-surface-container-low/50 border-t border-outline-variant/10 grid grid-cols-2 gap-4">
             {user ? (
               <button 
                 onClick={() => signOut(auth)}
                 className="py-3 px-4 glass-panel border border-white/5 text-[12px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-on-surface-variant col-span-2">
                  TERMINATE SESSION
               </button>
             ) : (
               <>
                 <button 
                   onClick={() => loginWithGoogle()}
                   className="py-3 px-4 bg-primary text-black text-[12px] font-black uppercase tracking-widest hover:bg-primary-dim transition-all rounded shadow-[0_0_20px_rgba(153,247,255,0.3)] col-span-2">
                    LINK NEURAL ID (GOOGLE)
                 </button>
               </>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileModal;
