import express from "express";
import {
  registerUser,
  emailExists,
  getUser,
  loginUser,
  deleteUser,
  updateImages,
  updateBio,
  updateProfilePicture,
  updateHandicapVisible,
  getUsers,
  sendEmailToAdmin,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/emailExists").post(emailExists);
userRouter.route("/login").post(loginUser);
userRouter.route("/").get(getUsers);
userRouter.route("/images").put(updateImages);
userRouter.route("/biography").put(updateBio);
userRouter.route("/handicap").put(updateHandicapVisible);
userRouter.route("/profilePicture").put(updateProfilePicture);
userRouter.route("/email").post(sendEmailToAdmin);
userRouter.route("/:id").get(getUser).delete(deleteUser);
export default userRouter;
