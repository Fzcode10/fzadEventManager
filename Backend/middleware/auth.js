const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const cleanToken = token.replace(/"/g, "");

    if (!cleanToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(cleanToken, process.env.SECRET);

    // 🔥 Attach data to request
    req.user = decoded;

    // console.log(req.user);

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;