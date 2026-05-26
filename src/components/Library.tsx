import { useState } from "react";
import { FileRecord } from "../types";
import { FileText, Book, Download, Send, Clock, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";

interface LibraryProps {
  files: FileRecord[];
  onDownload: (file: FileRecord) => void;
  userId: string;
}

export default function Library({ files, onDownload, userId }: LibraryProps) {
  const [activeQr, setActiveQr] = useState<string | null>(null);

  const getFileIcon = (mime: string) => {
    if (mime.includes("pdf")) return <FileText className="text-red-400" />;
    if (mime.includes("epub") || mime.includes("mobi")) return <Book className="text-amber-400" />;
    return <FileText className="text-blue-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 pb-20">
      <div className="flex items-center justify-between mb-6 px-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <Clock size={20} className="text-neon-cyan" />
          Recent Files
        </h2>
        <div className="flex items-center gap-4">
           <span className="hidden sm:block text-[10px] font-black tracking-widest text-slate-500 uppercase">
             E-Reader Friendly
           </span>
           <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {files.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="glass rounded-3xl p-12 text-center border-dashed"
            >
              <p className="text-slate-500 font-medium">No files in this room yet.</p>
            </motion.div>
          ) : (
            files.slice().reverse().map((file) => (
              <div key={file.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass group hover:bg-slate-800/60 transition-all rounded-2xl flex items-center p-4 gap-5"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900/80 flex items-center justify-center shrink-0">
                    {getFileIcon(file.mimeType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-neon-cyan transition-colors">
                      {file.originalName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-medium text-slate-500">{formatSize(file.size)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-xs font-medium text-slate-500">{getTimeAgo(file.uploadedAt)}</span>
                      {file.senderId === userId && (
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-neon-cyan bg-neon-cyan/10 px-1.5 rounded">You</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActiveQr(activeQr === file.id ? null : file.id)}
                      title="Direct QR Link"
                      className={`p-2.5 rounded-xl transition-all ${activeQr === file.id ? 'bg-neon-cyan text-deep-navy shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                    >
                      <QrCode size={18} />
                    </button>
                    <button 
                      onClick={() => onDownload(file)}
                      className="p-2.5 bg-slate-900 hover:bg-neon-cyan hover:text-deep-navy rounded-xl transition-all text-slate-400 group-hover:scale-110 active:scale-95"
                    >
                      <Download size={18} />
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
                      <div className="mt-2 p-6 glass rounded-2xl flex flex-col items-center gap-4 bg-slate-900/40">
                         <div className="p-3 bg-white rounded-xl shadow-2xl">
                           <QRCodeSVG 
                              value={`${window.location.origin}/api/files/${file.filename}`} 
                              size={160}
                              level="H"
                           />
                         </div>
                         <div className="text-center">
                            <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Direct Download Scan</p>
                            <p className="text-[10px] text-slate-500">Scan with your phone to start download immediately</p>
                         </div>
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
