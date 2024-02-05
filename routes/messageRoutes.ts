import express from "express";
import {
  createMessage,
  createThread,
  deleteThread,
  getInnerMessages,
  getMessages,
  updateThread,
} from "../controllers/messageController";

const messageRouter = express.Router();

messageRouter.route("/").post(createThread).put(updateThread);
messageRouter.route("/:id").get(getMessages).delete(deleteThread);
messageRouter.route("/thread").post(createMessage);
messageRouter.route("/thread/:id").get(getInnerMessages);
messageRouter.route("/thread/:threadId/toggleUnread/:userId");

export default messageRouter;
