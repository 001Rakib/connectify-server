const router = require("express").Router();
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");

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
    // Populate user info before sending back
    const comment = await Comment.findById(savedComment._id).populate(
      "user",
      "username profilePicture"
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
