import express from "express";
import {
  createMessage,
  createThread,
  deleteThread,
  getInnerMessages,
  getMessages,
} from "../controllers/messageController";

const messageRouter = express.Router();

messageRouter.route("/").post(createThread);
messageRouter.route("/:id").get(getMessages).delete(deleteThread);
messageRouter.route("/thread").post(createMessage);
messageRouter.route("/thread/:id").get(getInnerMessages);

export default messageRouter;
