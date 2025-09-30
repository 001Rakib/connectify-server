const router = require("express").Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

// --- GET ALL NOTIFICATIONS FOR A USER ---
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user.id })
      .populate("sender", "username name profilePicture")
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
