import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import merchandiseRoutes from "./routes/merchandiseRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { setupFileLogging } from "./utils/logger.js";

dotenv.config({ quiet: true });

// Setup file-based logging (replaces console methods)
setupFileLogging();

// Check for required environment variables on startup
const requiredEnvVars = {
  'MONGO_URI': process.env.MONGO_URI,
  'JWT_SECRET': process.env.JWT_SECRET,
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
};

console.log('\n🔍 Checking environment variables...');
let missingVars = [];
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    missingVars.push(key);
    console.log(`❌ ${key} is missing`);
  } else {
    // Mask sensitive values
    const maskedValue = key.includes('SECRET') || key.includes('KEY') 
      ? `${value.substring(0, 8)}...` 
      : value;
    console.log(`✅ ${key} is set (${maskedValue})`);
  }
}

if (missingVars.length > 0) {
  console.log(`\n⚠️  Warning: ${missingVars.length} required environment variable(s) are missing:`);
  missingVars.forEach(v => console.log(`   - ${v}`));
  console.log('   Please add them to your .env file\n');
} else {
  console.log('✅ All required environment variables are set\n');
}

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware - CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware (disabled for cleaner output)
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });

// JSON parsing middleware (webhook is handled separately in paymentRoutes)
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use("/api/assignments", assignmentRoutes);
app.use("/api/merchandise", merchandiseRoutes);
app.use("/api/contact", contactRoutes);

// Start server after database connection
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
