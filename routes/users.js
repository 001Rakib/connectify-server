const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const upload = require("../config/cloudinary");

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

router.put("/:id/follow", auth, async (req, res) => {
  // You can't follow yourself
  if (req.user.id === req.params.id) {
    return res.status(403).json({ msg: "You can't follow yourself" });
  }

  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      // --- Unfollow User ---
      await currentUser.updateOne({ $pull: { following: req.params.id } });
      await userToFollow.updateOne({ $pull: { followers: req.user.id } });
      res.status(200).json({ msg: "User unfollowed" });
    } else {
      // --- Follow User ---
      await currentUser.updateOne({ $push: { following: req.params.id } });
      await userToFollow.updateOne({ $push: { followers: req.user.id } });
      res.status(200).json({ msg: "User followed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// --- UPDATE USER PROFILE ---
router.put(
  "/profile",
  auth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      // Find the user to update
      const userToUpdate = await User.findById(req.user.id);
      if (!userToUpdate) {
        return res.status(404).json("User not found");
      }

      // Update bio if provided
      if (req.body.bio) {
        userToUpdate.bio = req.body.bio;
      }

      // Update profile picture if a new one is uploaded
      if (req.file) {
        userToUpdate.profilePicture = req.file.path;
      }

      // Save the updated user and send back the new data
      const updatedUser = await userToUpdate.save();

      // Don't send the password back
      const { password, ...others } = updatedUser._doc;
      res.status(200).json(others);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  }
);

module.exports = router;
