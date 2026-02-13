import jwt from "jsonwebtoken";
import Company from "../models/Company.js";
import User from "../models/User.js";

// Middleware that accepts both company and user authentication
const flexibleAuthMiddleware = async (req, res, next) => {
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
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Try to find company first
        const company = await Company.findById(decodedToken.id).select("-password");
        if (company) {
            req.companyData = company;
            return next();
        }

        // If not company, try user
        const user = await User.findById(decodedToken.id).select("-password");
        if (user) {
            req.userData = user;
            return next();
        }

        return res.status(404).json({ message: "Account not found" });

    } catch (error) {
        console.error('Flexible auth error:', error.message);
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
};

export default flexibleAuthMiddleware;
