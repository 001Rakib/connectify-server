const router = require("express").Router();
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");
const Notification = require("../models/Notification");
const Post = require("../models/Post");

// --- CREATE A COMMENT ---
router.post("/", auth, async (req, res) => {
  const { postId, text } = req.body;

  const newComment = new Comment({
    text,
    post: postId,
    user: req.user.id,
  });

  try {
    const savedComment = await newComment.save();

    // --- CREATE NOTIFICATION ---
    const post = await Post.findById(postId);
    if (post.user.toString() !== req.user.id) {
      const notification = new Notification({
        sender: req.user.id,
        receiver: post.user,
        type: "comment",
        post: postId,
      });
      await notification.save();
    }

    // Populate user info before sending back
    const comment = await Comment.findById(savedComment._id).populate(
      "user",
      "username name profilePicture"
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
