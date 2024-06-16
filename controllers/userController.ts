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
    numberOfLikeNotifications: 0,
    numberOfMessageNotifications: 0,
    maxNumberOfLike: 0,
    notificationsEnabledNewMatch: true,
    notificationsEnabledNewMessage: true,
    notificationsEnabledSuperLike: true,
    notificationsEnabledPromotions: true,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Error creating user");
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
// @route GET /api/users/except/:id/:interestedBy/:ageOfInterest
// @access Public
const getUsers = asyncHandler(async (req, res) => {
  const { id, interestedBy, ageOfInterest } = req.params;

  console.log("age", ageOfInterest);
  // Parse the ageOfInterest parameter, assuming it is a string in the format 'min-max'
  const [minAge, maxAge] = ageOfInterest.split("-").map(Number);

  // Calculate the date range for the age filter
  const currentDate = new Date();
  const minDateOfBirth = new Date(
    currentDate.setFullYear(currentDate.getFullYear() - maxAge)
  );
  currentDate.setFullYear(currentDate.getFullYear() + maxAge); // reset currentDate to now
  const maxDateOfBirth = new Date(
    currentDate.setFullYear(currentDate.getFullYear() - minAge)
  );

  let genreFilter = {};
  if (interestedBy === "female") {
    genreFilter = { genre: "female" };
  } else if (interestedBy === "male") {
    genreFilter = { genre: "male" };
  } else {
    genreFilter = { genre: "autre" };
  }

  const users = await User.find({
    _id: { $ne: id },
    ...genreFilter,
    dateOfBirth: { $gte: minDateOfBirth, $lte: maxDateOfBirth },
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

// @desc Update user handicap
// @route PUT /api/users/increaseLike
// @access Private
const updateMaxNumberOfLikes = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  console.log("id", userId);
  const user = await User.findById(userId);
  console.log("user", user);
  if (user) {
    user.maxNumberOfLike += 1;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Update user handicap
// @route PUT /api/users/updateDate
// @access Private
const updateDateWhereUserCanSwipeAgain = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  const date = new Date();
  const updatedDate = new Date(date.setDate(date.getDate() + 1));
  if (user) {
    user.dateWhenUserCanSwipeAgain = updatedDate;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Update user handicap
// @route PUT /api/users/updatePersonalData
// @access Private
const updatePersonalData = asyncHandler(async (req, res) => {
  const { id, email, password, phone } = req.body;

  const user = await User.findById(id);

  const date = new Date();
  const updatedDate = new Date(date.setDate(date.getDate() + 1));
  if (user) {
    user.email = email;
    user.password = password;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Update user handicap
// @route PUT /api/users/updateNotifications
// @access Private
const updateNotificationsSettings = asyncHandler(async (req, res) => {
  const {
    id,
    notificationsEnabledNewMatch,
    notificationsEnabledNewMessage,
    notificationsEnabledSuperLike,
    notificationsEnabledPromotions,
  } = req.body;

  const user = await User.findById(id);

  if (user) {
    user.notificationsEnabledNewMatch = notificationsEnabledNewMatch;
    user.notificationsEnabledNewMessage = notificationsEnabledNewMessage;
    user.notificationsEnabledSuperLike = notificationsEnabledSuperLike;
    user.notificationsEnabledPromotions = notificationsEnabledPromotions;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Update user handicap
// @route PUT /api/users/updateSettings
// @access Private
const updateSettings = asyncHandler(async (req, res) => {
  const { id, genre, interestedBy, ageOfInterest } = req.body;

  const user = await User.findById(id);

  if (user) {
    user.genre = genre;
    user.interestedBy = interestedBy;
    user.ageOfInterest = ageOfInterest;
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Update user handicap
// @route PUT /api/users/resetLike
// @access Private
const resetMaxNumberOfLikes = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const user = await User.findById(id);

  if (user) {
    user.maxNumberOfLike = 0;
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
  const { id } = req.params;
  const user = await User.findById(id).select("-passwordHash");
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

// @desc Add a notification for a specific user
// @route POST /api/users/likeNotification
// @access Private
const addLikeNotification = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (user) {
    user.numberOfLikeNotifications += 1;
    const updatedUser = await user.save();
    res.status(201).json(updatedUser);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// @desc Reset number of like notifications to 0
// @route PUT /api/users/likeNotification
// @access Private
const resetLikeNotification = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (user) {
    user.numberOfLikeNotifications = 0;
    const updatedUser = await user.save();
    res.status(201).json(updatedUser);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// @desc Boost user
// @route PUT /api/users/boost
// @access Private
const boostUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);

  if (user) {
    user.boost = true;
    const updatedUser = await user.save();
    res.status(201).json(updatedUser);
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
  resetLikeNotification,
  addLikeNotification,
  boostUser,
  updateMaxNumberOfLikes,
  resetMaxNumberOfLikes,
  updateDateWhereUserCanSwipeAgain,
  updatePersonalData,
  updateNotificationsSettings,
  updateSettings,
};
