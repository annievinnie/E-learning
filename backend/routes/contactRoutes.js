import express from "express";
import {
  submitContact,
  getAllContacts,
  markAsRead,
  markAsResponded,
  deleteContact,
  getUnreadCount,
  getRecentUnreadContacts,
} from "../controllers/contactController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }
  next();
};

// Public route - anyone can submit contact form
router.post("/submit", submitContact);

// Admin routes
router.get("/admin/all", verifyToken, verifyAdmin, getAllContacts);
router.get("/admin/unread-count", verifyToken, verifyAdmin, getUnreadCount);
router.get("/admin/recent-unread", verifyToken, verifyAdmin, getRecentUnreadContacts);
router.put("/admin/mark-read/:contactId", verifyToken, verifyAdmin, markAsRead);
router.put("/admin/mark-responded/:contactId", verifyToken, verifyAdmin, markAsResponded);
router.delete("/admin/delete/:contactId", verifyToken, verifyAdmin, deleteContact);

export default router;

