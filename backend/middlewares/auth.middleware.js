import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../config/env.js';
import { db } from '../config/firebase-admin.js';

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies["accessToken"];

        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized access." });
        }

        try {
            const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
            const user = await db.collection('users').doc(decoded.userId).get();

            if (!user.exists) {
                return res.status(401).json({ error: "Unauthorized access." });
            }

            req.user = user.data();
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Access token expired." });
            }
            throw error;
        }
    } catch (error) {
        console.log("Error in protectRoute middleware:", error);
        return res.status(401).json({ error: "Unauthorized access." });
    }
}

export const ownerRoute = (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        next();
    }
    else {
        res.status(403).json({ error: "Access denied - Owner only" });
    }
}