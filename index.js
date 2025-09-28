const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const userRoute = require("./routes/users");
const commentRoute = require("./routes/comments");

const PORT = process.env.PORT || 5000;

// initialize express app
const app = express();

//middleware
app.use(cors());
app.use(express.json());

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

app.get("/", (req, res) => {
  res.send("Connectify API is running..");
});

//routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);
app.use("/api/comments", commentRoute);

app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
