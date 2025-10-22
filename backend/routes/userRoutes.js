import express from "express";
import { signupUser, forgotPassword, resetPassword } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
