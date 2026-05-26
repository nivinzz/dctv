import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "motion/react";

import HomeView from "./components/HomeView";
import RoomHeader from "./components/RoomHeader";
import DropZone from "./components/DropZone";
import Library from "./components/Library";
import { FileRecord, RoomSyncData } from "./types";

const RECENT_ROOMS_KEY = "dctv_recent_rooms";
const USER_ID_KEY = "dctv_user_id";

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [userId] = useState(() => {
    const saved = localStorage.getItem(USER_ID_KEY);
    if (saved) return saved;
    const newId = uuidv4();
    localStorage.setItem(USER_ID_KEY, newId);
    return newId;
  });

  // Load history and check URL for room
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_ROOMS_KEY);
    if (saved) setRecentRooms(JSON.parse(saved));

    const params = new URLSearchParams(window.location.search);
    const r = params.get("r");
    if (r) setRoomId(r.toUpperCase());
  }, []);

  // Initialize Socket.io
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("room:sync", (data: RoomSyncData) => {
      setFiles(data.files);
      setUserCount(data.userCount);
    });

    newSocket.on("file:new", (file: FileRecord) => {
      setFiles((prev) => [...prev, file]);
    });

    newSocket.on("room:user_joined", (count: number) => setUserCount(count));
    newSocket.on("room:user_left", (count: number) => setUserCount(count));

    return () => {
      newSocket.close();
    };
  }, []);

  // Join room when ID changes
  useEffect(() => {
    if (socket && roomId) {
      socket.emit("room:join", roomId);
      
      // Update history
      setRecentRooms((prev) => {
        const next = [roomId, ...prev.filter((r) => r !== roomId)].slice(0, 6);
        localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(next));
        return next;
      });

      // Update URL without reload
      const url = new URL(window.location.href);
      url.searchParams.set("r", roomId);
      window.history.pushState({}, "", url);
    }
  }, [socket, roomId]);

  const generateRoomId = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomId(code);
  };

  const handleUpload = async (file: File) => {
    if (!roomId) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const res = await fetch(`/api/rooms/${roomId}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      // Server will emit file:new to all room members
    } catch (err) {
      console.error(err);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (file: FileRecord) => {
    window.location.href = `/api/files/${file.filename}`;
  };

  const handleLeave = () => {
    setRoomId(null);
    setFiles([]);
    const url = new URL(window.location.href);
    url.searchParams.delete("r");
    window.history.pushState({}, "", url);
  };

  return (
    <div className="min-h-screen selection:bg-neon-cyan selection:text-deep-navy">
      <AnimatePresence mode="wait">
        {!roomId ? (
          <HomeView 
            onJoinRoom={setRoomId} 
            onNewRoom={generateRoomId} 
            recentRooms={recentRooms}
          />
        ) : (
          <motion.div 
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-12 max-w-5xl"
          >
            <RoomHeader 
              roomId={roomId} 
              userCount={userCount} 
              onRegenerate={handleLeave} 
            />
            
            <DropZone onUpload={handleUpload} isUploading={isUploading} />
            
            <Library 
              files={files} 
              onDownload={handleDownload} 
              userId={userId} 
            />

            <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 glass rounded-full flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <span>P2P Encrypted</span>
               <div className="w-1 h-1 rounded-full bg-slate-800" />
               <span>Auto-Delete (1h)</span>
               <div className="w-1 h-1 rounded-full bg-slate-800" />
               <span>DCTV-Sync</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
