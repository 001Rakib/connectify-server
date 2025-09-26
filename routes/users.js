const router = require("express").Router();
const User = require("../models/User");

// --- GET A USER BY USERNAME ---
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    ); // find by username
    if (!user) {
      return res.status(404).json("User not found");
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
