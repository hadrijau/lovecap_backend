import express from "express";
import {
  createUser,
  emailExists,
  getUser,
  loginUser,
  deleteUser,
  getUsers,
  sendEmailToAdmin,
  updateUser,
  getUserByEmail,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/").post(createUser);
userRouter.route("/emailExists").post(emailExists);
userRouter.route("/login").post(loginUser);
userRouter.route("/except/:id/:interestedBy/:ageOfInterest").get(getUsers);
userRouter.route("/email").post(sendEmailToAdmin);
userRouter.route("/:id").get(getUser).delete(deleteUser).put(updateUser);
userRouter.route("/email/:email").get(getUserByEmail);
export default userRouter;
