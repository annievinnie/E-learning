import Contact from "../models/Contact.js";
import User from "../models/User.js";

// Submit contact form
export const submitContact = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    let userId = null;
    let userRole = "guest";

    // If user is logged in, get their info
    if (token) {
      try {
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
        const user = await User.findById(decoded.userId);
        if (user) {
          userId = user._id;
          userRole = user.role;
        }
      } catch (error) {
        // Token invalid or expired, treat as guest
        console.log("Token verification failed, treating as guest");
      }
    }

    if (!fullName || !email || !message) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required." 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please enter a valid email address." 
      });
    }

    const contact = new Contact({
      fullName,
      email,
      message,
      userRole,
      userId: userId || null,
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: "Thank you for your message! We will get back to you soon.",
      contact: contact,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again.",
      error: error.message,
    });
  }
};

// Get all contact submissions (Admin only)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .populate("userId", "fullName email role")
      .lean();

    // Count unread contacts
    const unreadCount = await Contact.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      contacts,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact submissions.",
      error: error.message,
    });
  }
};

// Mark contact as read
export const markAsRead = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findByIdAndUpdate(
      contactId,
      { isRead: true },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact submission not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact marked as read.",
      contact,
    });
  } catch (error) {
    console.error("Error marking contact as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark contact as read.",
      error: error.message,
    });
  }
};

// Mark contact as responded
export const markAsResponded = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { response } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      contactId,
      { 
        responded: true,
        response: response || "",
        isRead: true,
      },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact submission not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact marked as responded.",
      contact,
    });
  } catch (error) {
    console.error("Error marking contact as responded:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark contact as responded.",
      error: error.message,
    });
  }
};

// Delete contact submission
export const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findByIdAndDelete(contactId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact submission not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact submission deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact submission.",
      error: error.message,
    });
  }
};

// Get unread count (for notifications)
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Contact.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count.",
      error: error.message,
    });
  }
};

// Get recent unread contacts (for notifications)
export const getRecentUnreadContacts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const contacts = await Contact.find({ isRead: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "fullName email role")
      .lean();

    res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching recent unread contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent unread contacts.",
      error: error.message,
    });
  }
};

