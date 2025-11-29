import express from "express";
import {
  getUser,
  deleteUser,
  getUsers,
  updateUser,
  getUserByEmail,
} from "../controllers/userController";
import { createUser, loginUser, refreshToken } from "../controllers/authController";
import {
  loginLimiter,
  registerLimiter,
} from "../middleware/rateLimiter";

const userRouter = express.Router();

// Auth routes (publiques - pas d'authentification)
userRouter.route("/").post(registerLimiter, createUser);
userRouter.route("/login").post(loginLimiter, loginUser);
userRouter.route("/refresh").post(refreshToken);

// User routes (privées - authentification gérée par conditionalAuth dans app.ts)
userRouter.route("/except/:id/:interestedBy/:ageOfInterest").get(getUsers);
userRouter.route("/:id").get(getUser).delete(deleteUser).put(updateUser);
userRouter.route("/email/:email").get(getUserByEmail);
export default userRouter;
