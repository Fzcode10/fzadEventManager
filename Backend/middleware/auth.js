const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if(!auth){
      return res.status(401).json({message: "Authorization headre missing"});
    }

    const token = auth?.split(" ")[1];

    if(!token){
      return res.status(401).json({message : "Invalid authorization format"});
    }

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