import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import authRoutes from "./routes/auth";
import instructorRoutes from "./routes/instructor";
import studentRoutes from "./routes/student";
import { db } from "./services/firebase";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/", authRoutes);
app.use("/", instructorRoutes);
app.use("/", studentRoutes);

const port = Number(process.env.PORT || 4000);
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN?.split(",") || "*" },
});

type ChatPayload = { fromPhone: string; toPhone: string; text: string };

io.on("connection", (socket) => {
  socket.on("join", (roomId: string) => {
    if (roomId) socket.join(roomId);
  });

  socket.on("message", async (roomId: string, payload: ChatPayload) => {
    if (!roomId || !payload?.text) return;
    const now = Date.now();
    // Persist to Firestore under chats/{roomId}/messages
    const chatRef = db.collection("chats").doc(roomId).collection("messages").doc();
    await chatRef.set({ id: chatRef.id, ...payload, createdAt: now });
    io.to(roomId).emit("message", { id: chatRef.id, ...payload, createdAt: now });
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});


