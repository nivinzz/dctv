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
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <header className="flex flex-col items-center gap-3 mb-16">
          <div className="w-20 h-20 bg-navy-dark rounded-[2rem] flex items-center justify-center text-white shadow-xl mb-4">
            <div className="w-10 h-10 border-4 border-white rounded-lg relative after:content-[''] after:absolute after:bottom-1 after:left-1 after:right-1 after:h-1 after:bg-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-navy-dark leading-none uppercase">FILE HUB</h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Minimalist File Sync</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input 
              type="text" 
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER ROOM CODE"
              className="w-full bg-white rounded-[2rem] px-8 py-8 text-3xl font-black text-center tracking-[0.4em] placeholder:tracking-normal placeholder:font-black placeholder:text-slate-100 text-navy-dark focus:outline-none transition-all card-shadow"
            />
            {code.length >= 4 && (
              <motion.button 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                type="submit"
                className="absolute right-4 top-4 bottom-4 aspect-square bg-navy-dark text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <ArrowRight size={28} strokeWidth={3} />
              </motion.button>
            )}
          </div>

          <button 
            type="button"
            onClick={onNewRoom}
            className="w-full bg-white text-navy-dark font-black py-8 rounded-[2rem] flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all card-shadow uppercase tracking-widest text-xs"
          >
            <Plus size={20} strokeWidth={3} />
            Create New Room
          </button>
        </form>

        {recentRooms.length > 0 && (
          <div className="mt-20">
             <div className="flex items-center justify-center gap-3 text-slate-200 mb-6">
                <div className="h-px bg-slate-100 flex-1" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Recent History</span>
                <div className="h-px bg-slate-100 flex-1" />
             </div>
             <div className="grid grid-cols-3 gap-3">
                {recentRooms.map((r) => (
                  <button 
                    key={r}
                    onClick={() => onJoinRoom(r)}
                    className="bg-white py-4 px-4 rounded-2xl text-[11px] font-black text-slate-400 hover:text-navy-dark hover:scale-105 transition-all text-center card-shadow"
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
