const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const userNames = {}; // Store socket.id => username mapping

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, userName }) => {
    userNames[socket.id] = userName || socket.id;
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", { id: socket.id, name: userNames[socket.id] });
    console.log(`${userNames[socket.id]} joined room ${roomId}`);

    socket.on("offer", (data) => {
      socket.to(data.to).emit("offer", { ...data, from: socket.id });
    });

    socket.on("answer", (data) => {
      socket.to(data.to).emit("answer", { ...data, from: socket.id });
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.to).emit("ice-candidate", { ...data, from: socket.id });
    });

    socket.on("send-message", ({ roomId, message }) => {
      socket.to(roomId).emit("receive-message", { from: userNames[socket.id], message });
    });

    socket.on("disconnect", () => {
      const userName = userNames[socket.id] || socket.id;
      console.log("User disconnected:", socket.id);
      socket.to(Array.from(socket.rooms)).emit("user-left", userName);
      delete userNames[socket.id];
    });
  });
});

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});


