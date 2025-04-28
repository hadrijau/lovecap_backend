import express from "express";
import {
  createUser,
  getUser,
  loginUser,
  deleteUser,
  getUsers,
  updateUser,
  getUserByEmail,
  checkEmail,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.route("/").post(createUser);
userRouter.route("/emailExists").post(checkEmail);
userRouter.route("/login").post(loginUser);
userRouter.route("/except/:id/:interestedBy/:ageOfInterest").get(getUsers);
userRouter.route("/:id").get(getUser).delete(deleteUser).put(updateUser);
userRouter.route("/email/:email").get(getUserByEmail);
export default userRouter;
