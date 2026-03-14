import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] }
});

// Socket.io — stream test runner logs realtime
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("join-session", (sessionId) => socket.join(sessionId));
  socket.on("disconnect", () => console.log("Client disconnected"));
});

export { io };

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
