import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    if (typeof next === "function") {
      next();
    } else {
      console.error("AuthMiddleware: next is not a function");
      res.status(500).json({ message: "Internal server error: next is not a function" });
    }
  } catch (err) {
    console.error("AuthMiddleware error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};
