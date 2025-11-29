import asyncHandler from "express-async-handler";
import Message, { IMessage } from "../models/messageModel";
import { Request, Response } from "express";
import { encryptMessage, decryptMessage } from "../utils/encryption";

// @desc Get messages for a user
// @route GET /api/message/:id
// @access Public
const getMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({
      members: {
        $elemMatch: { id: id },
      },
    });

    // Déchiffrer les messages
    const decryptedMessages = messages.map((message) => {
      const decrypted = message.toObject();
      if (decrypted.latestMessage) {
        decrypted.latestMessage = decryptMessage(decrypted.latestMessage);
      }
      return decrypted;
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Error fetching messages", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc Get number of unread messages for a user
// @route GET /api/message/:id/unread
// @access Public
const getNumberOfUnreadMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({
      members: {
        $elemMatch: { id: id },
      },
    });

    const unreadMessages = messages.filter(
      (message) =>
        message.latestSender != id && message.latestSender != "No one"
    );
    res.status(200).json(unreadMessages.length);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc Create a messages thread for users
// @route POST /api/message
// @access Public
const createThread = asyncHandler(async (req, res) => {
  const { members, latestMessage, unread, updatedAt } = req.body;

  const memberIds = members.map((member: any) => member.id).sort();

  const existingThread = await Message.findOne({
    $and: [
      { [`members.${memberIds.length - 1}`]: { $exists: true } },
      { members: { $size: memberIds.length } },
      ...memberIds.map((id: string) => ({
        members: { $elemMatch: { id } },
      })),
    ],
  });

  if (existingThread) {
    // Déchiffrer le latestMessage si existant
    const decryptedThread = existingThread.toObject();
    if (decryptedThread.latestMessage) {
      decryptedThread.latestMessage = decryptMessage(decryptedThread.latestMessage);
    }
    res.status(200).json({ message: decryptedThread });
    return;
  }

  // Chiffrer le latestMessage avant de sauvegarder
  const encryptedLatestMessage = latestMessage ? encryptMessage(latestMessage) : latestMessage;

  const message = await Message.create({
    members,
    latestMessage: encryptedLatestMessage,
    unread,
    updatedAt,
    messages: [],
  });

  if (message) {
    // Déchiffrer pour la réponse
    const decryptedMessage = message.toObject();
    if (decryptedMessage.latestMessage) {
      decryptedMessage.latestMessage = decryptMessage(decryptedMessage.latestMessage);
    }
    res.status(201).json({ message: decryptedMessage });
    return;
  } else {
    res.status(400).json({ message: "Une erreur est survenue" });
    return;
  }
});

// @desc Create a messages thread for users
// @route PUT /api/message
// @access Public
const updateThread = asyncHandler(async (req, res) => {
  const { latestMessage, latestSender, threadId, updatedAt } = req.body;

  const thread = await Message.findById(threadId);

  if (!thread) {
    res.status(404).json({ message: "Thread not found" });
    return;
  }

  thread.latestSender = latestSender;
  // Chiffrer le latestMessage avant de sauvegarder
  thread.latestMessage = latestMessage ? encryptMessage(latestMessage) : latestMessage;
  thread.updatedAt = updatedAt;

  await thread.save();

  // Déchiffrer pour la réponse
  const decryptedThread = thread.toObject();
  if (decryptedThread.latestMessage) {
    decryptedThread.latestMessage = decryptMessage(decryptedThread.latestMessage);
  }

  res.status(200).json({ thread: decryptedThread });
});

// @desc Create a message in a thread
// @route POST /api/message/thread
// @access Public
const createMessage = asyncHandler(async (req, res) => {
  const { id, messageId, text, createdAt, userId, userName, image } = req.body;

  const thread = await Message.findById(id);

  if (!thread) {
    res
      .status(500)
      .json({ message: "The thread with the given ID was not found." });
    return;
  }

  // Chiffrer le texte du message avant de sauvegarder
  const encryptedText = encryptMessage(text);

  const message = {
    id: messageId,
    text: encryptedText, // Stocker le texte chiffré
    createdAt,
    user: {
      _id: userId,
      name: userName,
      avatar: image,
    },
  };

  const receiverIndex = thread.members.findIndex((user) => user.id != userId);

  if (receiverIndex !== -1) {
    thread.members[receiverIndex].unread = true;
  }

  thread.messages.push(message);
  // Chiffrer aussi le latestMessage
  thread.latestMessage = encryptMessage(text);

  const updatedThread = await thread.save();

  // Déchiffrer pour la réponse
  const decryptedThread = updatedThread.toObject();
  if (decryptedThread.latestMessage) {
    decryptedThread.latestMessage = decryptMessage(decryptedThread.latestMessage);
  }
  // Déchiffrer tous les messages
  if (decryptedThread.messages) {
    decryptedThread.messages = decryptedThread.messages.map((msg: any) => ({
      ...msg,
      text: decryptMessage(msg.text),
    }));
  }

  res.status(200).json({ updatedThread: decryptedThread });
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
  
  // Déchiffrer tous les messages
  const decryptedMessages = messages.map((msg: any) => ({
    ...msg.toObject ? msg.toObject() : msg,
    text: decryptMessage(msg.text),
  }));

  // Trier par date
  const sortedMessages = decryptedMessages.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.status(200).json({ messages: sortedMessages });
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
  updateThread,
  getNumberOfUnreadMessages,
};
