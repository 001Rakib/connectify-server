const auth = require("../middleware/auth");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");
const upload = require("../config/cloudinary");

const router = require("express").Router();

// --- CREATE A POST ---
router.post("/", auth, upload.single("image"), async (req, res) => {
  const newPost = {
    user: req.user.id,
    description: req.body.description,
    imageUrl: req.file ? req.file.path : "",
  };
  try {
    const savedPost = await Post.create(newPost);

    const post = await Post.findById(savedPost._id).populate(
      "user",
      "name profile picture"
    );
    res.status(201).json(post);
  } catch (error) {
    console.log(error);
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

router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    // Check if the post has already been liked by this user
    if (post.likes.includes(req.user.id)) {
      // If yes, unlike it
      await post.updateOne({ $pull: { likes: req.user.id } });
      res
        .status(200)
        .json({ message: "The post has been unliked", liked: false });
    } else {
      // If no, like it
      await post.updateOne({ $push: { likes: req.user.id } });
      res.status(200).json({ message: "The post has been liked", liked: true });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// --- GET A USER'S ALL POSTS (for profile page) ---
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json("User not found");
    }
    const posts = await Post.find({ user: user._id })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:postId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
