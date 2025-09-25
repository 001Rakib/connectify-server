const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
dotenv.config();

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

app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
