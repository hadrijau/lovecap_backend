import asyncHandler from "express-async-handler";
import Message, { IMessage } from "../models/messageModel";
import { Request, Response } from "express";

// @desc Get messages for a user
// @route GET /api/message/:id
// @access Public
const getMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("id", id);
    const messages = await Message.find({
      members: {
        $elemMatch: { id: id },
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc Create a messages thread for users
// @route POST /api/message
// @access Public
const createThread = asyncHandler(async (req, res) => {
  const { members, latestMessage, unread, dateSent, pushTokens } = req.body;

  const message = await Message.create({
    members,
    latestMessage,
    unread,
    dateSent,
    messages: [],
    pushTokens,
  });

  if (message) {
    res.status(201).json({ message });
  } else {
    res.status(400).json({ message: "Une erreur est survenue" });
  }
});

// @desc Create a message in a thread
// @route POST /api/message/thread
// @access Public
const createMessage = asyncHandler(async (req, res) => {
  const { id, messageId, text, createdAt, userId, userName, image, unread } =
    req.body;

  const thread = await Message.findById(id);

  if (!thread) {
    res
      .status(500)
      .json({ message: "The thread with the given ID was not found." });
    return;
  }

  const message = {
    id: messageId,
    text,
    createdAt,
    user: {
      _id: userId,
      name: userName,
      avatar: image,
    },
  };

  thread.unread = unread;
  thread.messages.push(message);
  thread.latestMessage = text;

  const updatedThread = await thread.save();
  res.status(200).json({ updatedThread });
});

// @desc Update read status of a thread
// @route PUT /api/messages/thread/:id
// @access Public
const updateReadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { unreadSender, dateSent } = req.body;

  const thread = await Message.findById(id);

  if (!thread) {
    res
      .status(500)
      .json({ message: "The thread with the given ID was not found." });
    return;
  }

  thread.unread = false;
  thread.unreadSender = unreadSender;
  thread.dateSent = dateSent || thread.dateSent;

  const updatedThread = await thread.save();
  res.status(200).json({ updatedThread });
});

// @desc Get messages in a thread
// @route GET /api/message/thread/:id
// @access Public
const getInnerMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const thread = await Message.findById(id);

  if (!thread) {
    res.status(404).json({ message: "No thread found" });
    return;
  }

  let messages: IMessage[] = thread.messages || [];
  messages = messages.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.status(200).json({ messages });
});

// @desc Delete a thread
// @route DELETE /api/message/:id
// @access Private/admin
const deleteThread = asyncHandler(async (req, res, next) => {
  const thread = await Message.findById(req.params.id);
  if (!thread) {
    res.status(404).json({ message: "Thread not found" });
    return;
  }

  try {
    await thread.deleteOne(); // Use deleteOne method to delete the document
    res.json({ message: "Thread removed" });
  } catch (error) {
    res.status(500).json({ message: "Error while deleting the thread" });
  }
});

export {
  createThread,
  getMessages,
  createMessage,
  deleteThread,
  getInnerMessages,
  updateReadStatus,
};
