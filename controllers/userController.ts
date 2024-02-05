import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken";
import { Request, Response, NextFunction } from "express";
import { sendEmail } from "../utils/sendEmail";

// @desc Register User
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstname,
    genre,
    interestedBy,
    dateOfBirth,
    ageOfInterest,
    handicap,
    profilePicture,
    handicapVisible,
    pictures,
    compatibility,
    expoPushToken,
  } = req.body;

  const user = await User.create({
    email,
    password,
    firstname,
    genre,
    interestedBy,
    dateOfBirth,
    ageOfInterest,
    handicap,
    profilePicture,
    handicapVisible,
    pictures,
    compatibility,
    expoPushToken,
    notifications: [],
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

// @desc Register User
// @route POST /api/users/emailExists
// @access Public
const emailExists = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).send("Cet utilisateur existe déja");
    throw new Error("User already exists");
  } else {
    res.status(201).send("Cet email n'est pas utilisé");
  }
});

// @desc Register User
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.JWT_SECRET!;
  if (!user) {
    res.status(400).send("The user not found");
    throw new Error("User not found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    const token = jwt.sign(
      {
        userId: user.id,
      },
      secret,
      { expiresIn: "365d" }
    );
    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("password is wrong!");
  }
});

// @desc Register User
// @route GET /api/users/except/:id
// @access Public
const getUsers = asyncHandler(async (req, res) => {
  console.log("id", req.params.id);
  const users = await User.find({
    _id: { $ne: req.params.id },
  });
  console.log("users", users);
  if (!users) {
    res.status(500).json({ message: "The users were not found" });
  } else {
    res.status(200).send(users);
  }
});

// @desc Send an email to admin to verify identity
// @route POST /api/users/email
// @access Public
const sendEmailToAdmin = asyncHandler(async (req, res) => {
  const { htmlOutput, subject } = req.body;
  try {
    sendEmail(subject, htmlOutput);
    res.status(200).json({ status: "OK" });
  } catch (err) {
    res.status(200).json({ status: "Error" });
  }
});

// @desc Update user pictures
// @route PUT /api/users/images
// @access Private
const updateImages = asyncHandler(async (req, res) => {
  const { id, imageUrl, index } = req.body;

  const user = await User.findById(id);
  if (user) {
    user.pictures![index] = imageUrl;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Update user biography
// @route PUT /api/users/biography
// @access Private
const updateBio = asyncHandler(async (req, res) => {
  const { id, biography } = req.body;

  const user = await User.findById(id);

  if (user) {
    user.biography = biography;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Update user biography
// @route PUT /api/users/profilePicture
// @access Private
const updateProfilePicture = asyncHandler(async (req, res) => {
  const { id, imageUrl } = req.body;

  const user = await User.findById(id);

  if (user) {
    user.profilePicture = imageUrl;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Update user handicap
// @route PUT /api/users/handicap
// @access Private
const updateHandicapVisible = asyncHandler(async (req, res) => {
  const { id, handicapVisible } = req.body;

  const user = await User.findById(id);

  if (user) {
    user.handicapVisible = handicapVisible;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Get User
// @route GET /api/users/:id
// @access Public
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    res
      .status(500)
      .json({ message: "The user with the given ID was not found." });
  } else {
    res.status(200).send(user);
  }
});

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private/admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const deleteUserNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.status(200).send(user.notifications);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Add a notification for a specific user
// @route POST /api/users/:userId/notifications
// @access Private
const addNotification = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { title, text, type } = req.body;

  const user = await User.findById(userId);

  if (user) {
    const newNotification = {
      title,
      text,
      type,
      unread: true, // Assuming a new notification is always unread
    };

    user.notifications.push(newNotification);
    const updatedUser = await user.save();
    res.status(201).json(updatedUser);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// @desc Delete a notification for a specific user
// @route DELETE /api/users/:userId/notifications/:notificationTitle
// @access Private
const deleteNotification = asyncHandler(async (req, res) => {
  const { userId, notificationTitle } = req.params;

  const user = await User.findById(userId);

  if (user) {
    const notificationIndex = user.notifications.findIndex(
      (notification) => notification.title === notificationTitle
    );

    if (notificationIndex !== -1) {
      user.notifications.splice(notificationIndex, 1);

      const updatedUser = await user.save();

      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export {
  registerUser,
  emailExists,
  loginUser,
  getUser,
  deleteUser,
  updateImages,
  updateBio,
  updateProfilePicture,
  updateHandicapVisible,
  getUsers,
  sendEmailToAdmin,
  addNotification,
  deleteNotification,
};
