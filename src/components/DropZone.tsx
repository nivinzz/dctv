import React, { useState, useRef } from "react";
import { UploadCloud, FileType, Zap, BarChart, RefreshCw } from "lucide-react";
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "relative group cursor-pointer aspect-[16/7] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 glass",
          isDragOver ? "border-neon-cyan bg-neon-cyan/5" : "border-slate-700/50 hover:border-slate-600",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <div className={cn(
          "p-5 rounded-3xl bg-slate-900/50 transition-transform duration-300 group-hover:scale-110",
          isDragOver && "scale-110 text-neon-cyan"
        )}>
          <UploadCloud className={cn("w-10 h-10", isDragOver ? "text-neon-cyan" : "text-slate-500")} />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-slate-100 italic">
            {isDragOver ? "Drop to sync" : "Drag files here or click to browse"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            PDF, EPUB, MOBI, AZW3 supported up to 50MB
          </p>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.epub,.mobi,.azw3"
        />

        {isUploading && (
          <div className="absolute inset-x-0 bottom-0 p-4">
             <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-neon-cyan"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
             </div>
          </div>
        )}
      </motion.div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap justify-center gap-3">
         <ActionButton icon={<Zap size={16} />} label="Kepubify" />
         <ActionButton icon={<BarChart size={16} />} label="Optimize PDF" />
         <ActionButton icon={<RefreshCw size={16} />} label="Convert to EPUB" />
      </div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  const [active, setActive] = useState(false);
  return (
    <button 
      onClick={() => setActive(!active)}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all border",
        active 
          ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan glow-cyan" 
          : "bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-100"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
