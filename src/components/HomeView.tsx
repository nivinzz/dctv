import React, { useState } from "react";
import { Zap, Plus, ArrowRight, History } from "lucide-react";
import { motion } from "motion/react";

interface HomeViewProps {
  onJoinRoom: (code: string) => void;
  onNewRoom: () => void;
  recentRooms: string[];
}

export default function HomeView({ onJoinRoom, onNewRoom, recentRooms }: HomeViewProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length >= 4) {
      onJoinRoom(code.toUpperCase());
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-8">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan to-indigo-500 flex items-center justify-center glow-cyan">
              <Zap size={32} className="text-deep-navy fill-deep-navy" />
           </div>
        </div>
        
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">DCTV-QuickSync</h1>
        <p className="text-slate-500 font-medium mb-12">Deep-navy minimalist file transfer.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <input 
              type="text" 
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter Room Code"
              className="w-full bg-slate-800 border-2 border-slate-700/50 rounded-2xl px-6 py-5 text-2xl font-black text-center tracking-[0.5em] placeholder:tracking-normal placeholder:font-bold focus:border-neon-cyan focus:outline-none transition-all group-hover:border-slate-600"
            />
            {code.length >= 4 && (
              <motion.button 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                type="submit"
                className="absolute right-3 top-3 bottom-3 aspect-square bg-neon-cyan text-deep-navy rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <ArrowRight size={24} />
              </motion.button>
            )}
          </div>

          <div className="pt-2 text-slate-500 font-bold text-xs uppercase tracking-widest">or</div>

          <button 
            type="button"
            onClick={onNewRoom}
            className="w-full bg-white text-deep-navy font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
          >
            <Plus size={20} />
            Create New Room
          </button>
        </form>

        {recentRooms.length > 0 && (
          <div className="mt-16 text-left">
             <div className="flex items-center gap-2 text-slate-500 mb-4 ml-2">
                <History size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Recent Rooms</span>
             </div>
             <div className="grid grid-cols-3 gap-3">
                {recentRooms.map((r) => (
                  <button 
                    key={r}
                    onClick={() => onJoinRoom(r)}
                    className="glass py-3 px-2 rounded-xl text-xs font-black text-slate-400 hover:text-white hover:border-slate-500 transition-all text-center"
                  >
                    {r}
                  </button>
                ))}
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
