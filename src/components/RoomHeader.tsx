import { useState } from "react";
import { Copy, RefreshCw, Check } from "lucide-react";
import { motion } from "motion/react";

interface RoomHeaderProps {
  roomId: string;
  userCount: number;
  onRegenerate: () => void;
}

export default function RoomHeader({ roomId, onRegenerate }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] p-12 card-shadow flex flex-col items-center justify-center relative min-h-[280px]"
      >
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300 mb-6">ROOM CODE</span>
        <div className="flex items-baseline gap-4">
            <h2 className="text-8xl font-black tracking-tight text-navy-dark leading-none">{roomId}</h2>
            <div className="flex flex-col gap-2">
              <button 
                onClick={copyCode} 
                className="text-slate-100 hover:text-navy-dark transition-colors"
                title="Copy Code"
              >
                {copied ? <Check size={28} className="text-green-500" /> : <Copy size={28} />}
              </button>
            </div>
        </div>
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <button 
            onClick={onRegenerate}
            className="flex items-center gap-2 text-[10px] font-black text-slate-200 hover:text-navy-dark transition-colors uppercase tracking-[0.2em]"
          >
            <RefreshCw size={12} strokeWidth={3} />
            Reset Room
          </button>
        </div>
      </motion.div>
    </div>
  );
}
