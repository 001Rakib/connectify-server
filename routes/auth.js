const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//~Register
router.post("/register", async (req, res) => {
  try {
    //checking if the user already exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) return res.status(400).json("User already exists");

    // check if username already exists
    const usernameExists = await User.findOne({ username: req.body.username });
    if (usernameExists) return res.status(400).json("username already exists");

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create user to the database
    const user = await User.create({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

//~Login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("User not found");

    //validate password
    const isPasswordMatched = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordMatched) return res.status(400).json("Wrong Password");

    //create and assign a jwt token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, token });
  } catch (error) {
    res.status(500).json(err);
  }
});
module.exports = router;
