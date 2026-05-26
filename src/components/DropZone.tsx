import React, { useState, useRef } from "react";
import { FileUp, Zap, Scissors, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DropZoneProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export default function DropZone({ onUpload, isUploading }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <div className="w-full flex shrink-0">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "bg-white rounded-[3rem] p-12 card-shadow flex items-center gap-10 cursor-pointer transition-all duration-300 min-h-[280px] w-full relative group",
          isDragOver ? "ring-8 ring-navy-dark/5" : "hover:scale-[1.01]",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <div className="w-24 h-24 bg-navy-dark rounded-3xl flex items-center justify-center text-white shrink-0 shadow-2xl transition-transform group-hover:scale-110">
          <FileUp size={40} strokeWidth={2.5} />
        </div>
        
        <div className="flex-1">
          <h2 className="text-4xl font-black tracking-tight text-navy-dark uppercase italic leading-none">DROP BOOKS</h2>
          <p className="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-[0.2em]">
            EPUB, PDF, MOBI (UP TO 200MB)
          </p>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="bg-transparent border-2 border-red-50 text-red-500 text-[10px] font-black px-6 py-4 rounded-2xl uppercase tracking-widest hover:bg-red-50 transition-colors"
        >
          Reset to default
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.epub,.mobi,.azw3"
        />

        {isUploading && (
          <div className="absolute inset-x-12 bottom-12">
             <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-navy-dark"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
             </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function ActionSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full">
         <ActionButton icon={<RefreshCw size={24} strokeWidth={3} />} label="EPUB TO MOBI" />
         <ActionButton icon={<Zap size={24} strokeWidth={3} />} label="KEPUBIFY" />
         <ActionButton icon={<Scissors size={24} strokeWidth={3} />} label="OPTIMIZE PDF" />
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  const [active, setActive] = useState(false);
  return (
    <button 
      onClick={() => setActive(!active)}
      className={cn(
        "bg-white h-32 rounded-[2.5rem] px-8 flex items-center gap-6 text-[12px] font-black uppercase tracking-[0.2em] transition-all card-shadow",
        active 
          ? "ring-8 ring-navy-dark/5" 
          : "hover:scale-[1.02]"
      )}
    >
      <div className="text-slate-200 shrink-0">
        {icon}
      </div>
      <span className="text-navy-dark truncate">{label}</span>
    </button>
  );
}
