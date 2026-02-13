import jwt from "jsonwebtoken";
import User from "../models/User.js";

const userAuthMiddleware = async (req, res, next) => {
  try {
    // Support both 'token' header and 'Authorization: Bearer <token>' format
    let token = req.headers.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized login again" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.userData = user;

    next();
  } catch (error) {
    console.error('User auth error:', error.message);
    return res.status(401).json({ message: "Unauthorized login again" });
  }
};

export default userAuthMiddleware;
