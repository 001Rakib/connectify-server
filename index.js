const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
dotenv.config();

const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const userRoute = require("./routes/users");
const commentRoute = require("./routes/comments");
const notificationRoute = require("./routes/notifications");

const PORT = process.env.PORT || 5000;

// initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

//---Database Connection--
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongodb Connected...");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

connectDB();

// --- Socket.IO Connection Logic ---
io.on("connection", (socket) => {
  // 1. Take userId and socketId from user
  socket.on("addUser", (userId) => {
    if (userId) {
      // --- CHANGE 1: JOIN A ROOM ---
      // Each user joins a room named after their own userId.
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    }
  });

  // 2. Send a notification
  socket.on("sendNotification", ({ senderId, receiverId, type, post }) => {
    io.to(receiverId).emit("getNotification", {
      senderId,
      type,
      post,
    });
  });

  // 3. Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Connectify API is running..");
});

//routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);
app.use("/api/comments", commentRoute);
app.use("/api/notifications", notificationRoute);
server.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
