import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// --- Configuration ---
const PORT = 3000;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const FILE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// --- Server Setup ---
async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // --- Multer Configuration ---
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const id = uuidv4();
      cb(null, `${id}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });

  // --- State Management (In-Memory) ---
  interface FileRecord {
    id: string;
    originalName: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: number;
    senderId: string;
  }

  interface Room {
    id: string;
    files: FileRecord[];
    users: Set<string>;
  }

  const rooms = new Map<string, Room>();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- API Routes ---

  // Upload file to a specific room
  app.post("/api/rooms/:roomId/upload", upload.single("file"), (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let room = rooms.get(roomId);
    if (!room) {
      // Auto-create room if it doesn't exist yet (robustness)
      room = { id: roomId, files: [], users: new Set() };
      rooms.set(roomId, room);
    }

    const fileRecord: FileRecord = {
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: Date.now(),
      senderId: userId || "anonymous",
    };

    room.files.push(fileRecord);
    io.to(roomId).emit("file:new", fileRecord);

    res.json(fileRecord);
  });

  // Delete file
  app.delete("/api/rooms/:roomId/files/:fileId", (req, res) => {
    const { roomId, fileId } = req.params;
    const room = rooms.get(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    const fileIndex = room.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return res.status(404).json({ error: "File not found" });

    const [file] = room.files.splice(fileIndex, 1);
    const filePath = path.join(UPLOADS_DIR, file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    io.to(roomId).emit("file:deleted", fileId);
    res.json({ success: true });
  });

  // Download file
  app.get("/api/files/:filename", (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    res.download(filePath);
  });

  // --- Socket.io Logic ---
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("room:join", (roomId: string) => {
      socket.join(roomId);
      
      let room = rooms.get(roomId);
      if (!room) {
        room = { id: roomId, files: [], users: new Set() };
        rooms.set(roomId, room);
      }
      room.users.add(socket.id);
      
      // Send current room state
      socket.emit("room:sync", {
        files: room.files,
        userCount: room.users.size,
      });

      // Notify others
      socket.to(roomId).emit("room:user_joined", room.users.size);
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (rooms.has(roomId)) {
          const room = rooms.get(roomId)!;
          room.users.delete(socket.id);
          
          if (room.users.size === 0) {
            // Clean up room memory if empty (files stay until expiry)
            // Or keep for a bit... let's keep it for now as expiry handles files.
          } else {
            io.to(roomId).emit("room:user_left", room.users.size);
          }
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // --- Cleanup Task ---
  setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, roomId) => {
      room.files = room.files.filter((file) => {
        const isExpired = now - file.uploadedAt > FILE_EXPIRY_MS;
        if (isExpired) {
          const filePath = path.join(UPLOADS_DIR, file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          return false;
        }
        return true;
      });

      // If room is empty and has no files, remove it
      if (room.users.size === 0 && room.files.length === 0) {
        rooms.delete(roomId);
      }
    });
  }, 10 * 60 * 1000); // Check every 10 mins

  // --- Vite / Static Handling ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
