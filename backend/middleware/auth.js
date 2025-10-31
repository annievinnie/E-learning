import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "No token provided." 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid token." 
    });
  }
};

// Middleware to verify student role
export const verifyStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Student role required." 
    });
  }
  next();
};

// Middleware to verify teacher role
export const verifyTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Teacher role required." 
    });
  }
  next();
};

// Middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Admin role required." 
    });
  }
  next();
};

