import express from "express";
import { sendEmail } from "../controllers/emailController";

const emailRouter = express.Router();

emailRouter.route("/").post(sendEmail);

export default emailRouter;
