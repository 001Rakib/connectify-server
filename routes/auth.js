const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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
      expiresIn: "15m",
    });

    // --- Create Refresh Token ---
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Store refresh token in a secure, httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, token });
  } catch (error) {
    res.status(500).json(err);
  }
});

// --- REFRESH ACCESS TOKEN ---
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json("You are not authenticated!");

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json("Refresh token is not valid!");

    const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.status(200).json({ accessToken: newAccessToken });
  });
});

// --- LOGOUT ---
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json("User has been logged out.");
});

// --- FORGOT PASSWORD ---
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // For security, don't reveal that the user does not exist
      return res
        .status(200)
        .json(
          "If an account with that email exists, a password reset link has been sent."
        );
    }

    // 1. Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash the token and save it to the user model
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    await user.save();

    // 3. Create the reset URL
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process within ten minutes of receiving it:\n\n${resetUrl}`;

    // 4. Send the email using Nodemailer
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });

    res
      .status(200)
      .json(
        "If an account with that email exists, a password reset link has been sent."
      );
  } catch (err) {
    console.error(err);
    // Invalidate the token if there was an error
    // (user.passwordResetToken = undefined; user.passwordResetExpires = undefined; await user.save();)
    res.status(500).json("Error sending email.");
  }
});

// --- RESET PASSWORD ---
router.put("/reset-password/:token", async (req, res) => {
  try {
    // 1. Hash the incoming token from the URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // 2. Find the user by the hashed token and check if it's not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json("Token is invalid or has expired.");
    }

    // 3. Set the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // 4. Clear the reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json("Password has been successfully reset.");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
