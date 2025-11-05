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

// Middleware
app.use(cors());

// JSON parsing middleware (webhook is handled separately in paymentRoutes)
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("E-learning backend is running");
});

app.use("/api", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/courses", courseRoutes);

// Start server after database connection
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
