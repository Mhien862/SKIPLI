"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const auth_1 = __importDefault(require("./routes/auth"));
const instructor_1 = __importDefault(require("./routes/instructor"));
const student_1 = __importDefault(require("./routes/student"));
const firebase_1 = require("./services/firebase");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express_1.default.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/", auth_1.default);
app.use("/", instructor_1.default);
app.use("/", student_1.default);
const port = Number(process.env.PORT || 4000);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: process.env.CORS_ORIGIN?.split(",") || "*" },
});
io.on("connection", (socket) => {
    socket.on("join", (roomId) => {
        if (roomId)
            socket.join(roomId);
    });
    socket.on("message", async (roomId, payload) => {
        if (!roomId || !payload?.text)
            return;
        const now = Date.now();
        // Persist to Firestore under chats/{roomId}/messages
        const chatRef = firebase_1.db.collection("chats").doc(roomId).collection("messages").doc();
        await chatRef.set({ id: chatRef.id, ...payload, createdAt: now });
        io.to(roomId).emit("message", { id: chatRef.id, ...payload, createdAt: now });
    });
});
server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map