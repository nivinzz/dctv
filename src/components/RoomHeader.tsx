import { useState } from "react";
import { Copy, RefreshCw, QrCode as QrIcon, Users, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "motion/react";

interface RoomHeaderProps {
  roomId: string;
  userCount: number;
  onRegenerate: () => void;
}

export default function RoomHeader({ roomId, userCount, onRegenerate }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = window.location.origin + "?r=" + roomId;

  return (
    <div className="flex flex-col items-center mb-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 w-full max-w-md relative overflow-hidden group"
      >
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-full text-xs text-slate-400">
            <Users size={12} className="text-neon-cyan" />
            <span>{userCount} active</span>
          </div>
        </div>

        <div className="text-center mb-2">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Room Code</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <h1 className="text-6xl font-black tracking-tighter text-white select-all">
            {roomId}
          </h1>
          <div className="flex flex-col gap-2">
            <button 
              onClick={copyCode}
              title="Copy Code"
              className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
            </button>
            <button 
              onClick={() => setShowQr(!showQr)}
              title="Show QR"
              className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <QrIcon size={20} />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button 
            onClick={onRegenerate}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-neon-cyan transition-colors"
          >
            <RefreshCw size={12} />
            New Room
          </button>
        </div>

        <AnimatePresence>
          {showQr && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col items-center mt-6 p-4 bg-white rounded-2xl">
                <QRCodeSVG value={shareUrl} size={180} />
                <p className="mt-4 text-xs text-slate-900 font-medium">Scan to join room instantly</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
