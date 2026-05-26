import { useState } from "react";
import { FileRecord } from "../types";
import { BookOpen, Trash2, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";

interface LibraryProps {
  files: FileRecord[];
  onDownload: (file: FileRecord) => void;
  userId: string;
}

export default function Library({ files, onDownload, userId }: LibraryProps) {
  const [activeQr, setActiveQr] = useState<string | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-navy-dark rounded-xl flex items-center justify-center text-white">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black text-navy-dark uppercase tracking-tight">
            LIBRARY ({files.length})
          </h2>
        </div>
        <button className="bg-white border-2 border-slate-50 text-slate-300 text-[10px] font-black px-6 py-4 rounded-2xl uppercase tracking-widest hover:text-navy-dark transition-all">
          SELECT ALL
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {files.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="bg-white rounded-[2rem] p-16 text-center card-shadow"
            >
              <p className="text-slate-300 font-black uppercase tracking-widest text-xs">NO BOOKS SYNCED</p>
            </motion.div>
          ) : (
            files.slice().reverse().map((file, index) => (
              <div key={file.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onDownload(file)}
                  className="bg-white group hover:scale-[1.01] transition-all duration-300 rounded-[2rem] flex items-center p-8 gap-10 card-shadow cursor-pointer relative"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 font-black text-slate-200 text-sm">
                    {String(files.length - index).padStart(2, '0')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-navy-dark truncate leading-tight mb-2">
                      {file.originalName}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-50 px-3 py-1 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {file.originalName.split('.').pop()?.toUpperCase() || 'FILE'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        {formatSize(file.size)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NEW</span>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveQr(activeQr === file.id ? null : file.id);
                      }}
                      className="text-slate-100 hover:text-navy-dark transition-colors"
                    >
                      <QrCode size={24} />
                    </button>

                    <button 
                      className="text-slate-100 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {activeQr === file.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-8 bg-white rounded-[2rem] card-shadow flex flex-col items-center gap-6 mx-8">
                         <div className="p-4 bg-white border-8 border-slate-50 rounded-3xl">
                           <QRCodeSVG 
                              value={`${window.location.origin}/api/files/${file.filename}`} 
                              size={200}
                              level="H"
                           />
                         </div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">DIRECT BOOK DOWNLOAD</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
