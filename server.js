// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);

// app.use(cors());

// const io = new Server(server, {
//   cors: {
//     origin: "*", // For local testing; change this in production
//     methods: ["GET", "POST"]
//   }
// });

// const userNames = {};

// io.on("connection", (socket) => {
//   console.log("✅ User connected:", socket.id);

//   socket.on("join-room", ({ roomId, userName }) => {
//     userNames[socket.id] = userName || socket.id;
//     socket.join(roomId);
//     console.log(`🚪 ${userName} joined room ${roomId}`);

//     socket.to(roomId).emit("user-joined", {
//       id: socket.id,
//       name: userNames[socket.id],
//     });
//     socket.emit("joined-success", roomId);
//   });

//  socket.on("ready", (roomId) => {
//   console.log(`🔔 ${socket.id} is ready in room ${roomId}`);
//   socket.to(roomId).emit("ready", { id: socket.id });
// });


//   socket.on("offer", (data) => {
//     socket.to(data.to).emit("offer", { ...data, from: socket.id });
//   });

//   socket.on("answer", (data) => {
//     socket.to(data.to).emit("answer", { ...data, from: socket.id });
//   });

//   socket.on("ice-candidate", (data) => {
//     socket.to(data.to).emit("ice-candidate", { ...data, from: socket.id });
//   });

//   socket.on("send-message", ({ roomId, message }) => {
//     socket.to(roomId).emit("receive-message", {
//       from: userNames[socket.id],
//       message,
//     });
//   });

//   socket.on("disconnect", () => {
//     const name = userNames[socket.id] || socket.id;
//     console.log("❌ User disconnected:", name);

//     socket.rooms.forEach((roomId) => {
//       if (roomId !== socket.id) {
//         socket.to(roomId).emit("user-left", name);
//       }
//     });

//     delete userNames[socket.id];
//   });
// });

// server.listen(5000, () => {
//   console.log("🚀 Server is running at http://localhost:5000");
// });
// // 




// // server.js
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);

// // Middleware
// app.use(cors());

// // Socket.io setup with CORS config
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Allow all origins (you can restrict in production)
//     methods: ["GET", "POST"],
//   },
// });

// const userNames = {}; // Store username by socket ID

// // WebSocket connection
// io.on("connection", (socket) => {
//   console.log("✅ User connected:", socket.id);

//   // When a user joins a room
//   socket.on("join-room", ({ roomId, userName }) => {
//     const name = userName || socket.id;
//     userNames[socket.id] = name;

//     socket.join(roomId);
//     console.log(`🚪 ${name} joined room ${roomId}`);

//     // Notify others in the room
//     socket.to(roomId).emit("user-joined", {
//       id: socket.id,
//       name,
//     });

//     // Notify the joining user
//     socket.emit("joined-success", roomId);
//   });

//   // When a user is ready for WebRTC connection
//   socket.on("ready", (roomId) => {
//     console.log(`🔔 ${socket.id} is ready in room ${roomId}`);
//     socket.to(roomId).emit("ready", { id: socket.id });
//   });

//   // WebRTC signaling: offer
//   socket.on("offer", (data) => {
//     socket.to(data.to).emit("offer", { ...data, from: socket.id });
//   });

//   // WebRTC signaling: answer
//   socket.on("answer", (data) => {
//     socket.to(data.to).emit("answer", { ...data, from: socket.id });
//   });

//   // WebRTC signaling: ICE candidate
//   socket.on("ice-candidate", (data) => {
//     socket.to(data.to).emit("ice-candidate", { ...data, from: socket.id });
//   });

//   // Chat message
//   socket.on("send-message", ({ roomId, message }) => {
//     const name = userNames[socket.id] || "Anonymous";
//     socket.to(roomId).emit("receive-message", {
//       from: name,
//       message,
//     });
//   });

//   // On disconnect
//   socket.on("disconnect", () => {
//     const name = userNames[socket.id] || socket.id;
//     console.log("❌ User disconnected:", name);

//     // Notify other users in the same room
//     socket.rooms.forEach((roomId) => {
//       if (roomId !== socket.id) {
//         socket.to(roomId).emit("user-left", {
//           id: socket.id,
//           name,
//         });
//       }
//     });

//     // Cleanup
//     delete userNames[socket.id];
//   });
// });

// // Start server
// const PORT = 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server is running at http://localhost:${PORT}`);
// });









// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userNames = {};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join-room", ({ roomId, userName }) => {
    const name = userName || socket.id;
    userNames[socket.id] = name;

    socket.join(roomId);
    console.log(`🚪 ${name} joined room ${roomId}`);

    socket.to(roomId).emit("user-joined", {
      id: socket.id,
      name,
    });

    socket.emit("joined-success", roomId);
  });

  socket.on("ready", (roomId) => {
    console.log(`🔔 ${socket.id} is ready in room ${roomId}`);
    // 🔧 Change here: Notify ALL users in the room
    io.in(roomId).emit("ready", { id: socket.id });
  });

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
    const name = userNames[socket.id] || "Anonymous";
    socket.to(roomId).emit("receive-message", {
      from: name,
      message,
    });
  });

  socket.on("disconnect", () => {
    const name = userNames[socket.id] || socket.id;
    console.log("❌ User disconnected:", name);

    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("user-left", {
          id: socket.id,
          name,
        });
      }
    }

    delete userNames[socket.id];
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
