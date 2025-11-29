import express from "express";
import { sendEmail } from "../controllers/emailController";
import { emailLimiter } from "../middleware/rateLimiter";

const emailRouter = express.Router();

// Route email est privée (authentification gérée par conditionalAuth dans app.ts)
emailRouter.route("/").post(emailLimiter, sendEmail);

export default emailRouter;
