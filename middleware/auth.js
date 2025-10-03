const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    // The 'return' is crucial. It stops the function from executing further.
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // Pass control to the next handler
  } catch (err) {
    // If the token is invalid, this will be the ONLY response sent.
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = auth;
