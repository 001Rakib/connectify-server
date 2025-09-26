const auth = require("../middleware/auth");
const Post = require("../models/Post");

const router = require("express").Router();

// --- CREATE A POST ---
router.post("/", auth, async (req, res) => {
  const newPost = {
    user: req.user.id,
    description: req.body.description,
  };
  try {
    const savedPost = await Post.create(newPost);

    const post = await Post.findById(savedPost._id).populate(
      "user",
      "name profile picture"
    );
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json(err);
  }
});

// --- GET ALL POSTS (for the feed) ---
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
