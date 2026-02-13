import jwt from "jsonwebtoken";
import Company from "../models/Company.js";

const companyAuthMiddleware = async (req, res, next) => {
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

    const company = await Company.findById(decodedToken.id).select("-password");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    req.companyData = company;

    next();
  } catch (error) {
    console.error('Company auth error:', error.message);
    return res.status(401).json({ message: "Unauthorized login again" });
  }
};

export default companyAuthMiddleware;
