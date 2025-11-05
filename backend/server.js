import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

dotenv.config();

const app = express();

// Middleware - CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Request headers:', req.headers);
  next();
});

// JSON parsing middleware (webhook is handled separately in paymentRoutes)
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("E-learning backend is running");
});

// Test endpoint to verify backend is reachable
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend API is working!", timestamp: new Date().toISOString() });
});

// Debug: List all registered routes
app.get("/api/routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path
      });
    }
  });
  res.json({ routes });
});

// Register routes - order matters!
app.use("/api", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/courses", courseRoutes);

// Start server after database connection
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("\n=== Registered Routes ===");
      // Log routes after server starts
      if (app._router && app._router.stack) {
        app._router.stack.forEach((middleware) => {
          if (middleware.route) {
            const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
            console.log(`${methods} ${middleware.route.path}`);
          } else if (middleware.name === 'router' && middleware.regexp) {
            console.log(`Router mounted at: ${middleware.regexp}`);
          }
        });
      }
      console.log("========================\n");
      console.log("✅ Teacher application endpoint: POST /api/teacher/apply");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
