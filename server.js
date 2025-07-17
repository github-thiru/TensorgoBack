const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://tensorgofront.vercel.app", // optional frontend deploy link
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userNames = {};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // When user joins a room
  socket.on("join-room", ({ roomId, userName }) => {
    userNames[socket.id] = userName || socket.id;
    socket.join(roomId);
    console.log(`🚪 ${userName} joined room ${roomId}`);
    
    // Inform others in the room
    socket.to(roomId).emit("user-joined", { id: socket.id, name: userNames[socket.id] });

    // Tell others to establish connection
    socket.emit("joined-success", roomId);
  });

  // 🔁 Emit 'ready' to notify others for WebRTC
  socket.on("ready", (roomId) => {
    socket.to(roomId).emit("ready", socket.id);
  });

  // Handle WebRTC signaling
  socket.on("offer", (data) => {
    socket.to(data.to).emit("offer", { ...data, from: socket.id });
  });

  socket.on("answer", (data) => {
    socket.to(data.to).emit("answer", { ...data, from: socket.id });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.to).emit("ice-candidate", { ...data, from: socket.id });
  });

  // Handle chat messages
  socket.on("send-message", ({ roomId, message }) => {
    socket.to(roomId).emit("receive-message", {
      from: userNames[socket.id],
      message,
    });
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const name = userNames[socket.id] || socket.id;
    console.log("❌ User disconnected:", name);
    
    // Notify all rooms the user was part of
    socket.rooms.forEach(roomId => {
      socket.to(roomId).emit("user-left", name);
    });

    delete userNames[socket.id];
  });
});

server.listen(5000, () => {
  console.log("🚀 Server is running on http://localhost:5000");
});
