import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken";
import { Request, Response } from "express";

// @desc Register User
// @route POST /api/users
// @access Public
const createUser = asyncHandler(async (req, res) => {
  const {
    firstname,
    email,
    password,
    genre,
    interestedBy,
    dateOfBirth,
    ageOfInterest,
    handicap,
    handicapVisible,
    profilePicture,
    expoPushToken,
    biography,
    maxNumberOfLike,
    dateWhenUserCanSwipeAgain,
    numberOfLikeNotifications,
    pictures,
    boost,
    notificationsEnabledNewMatch,
    notificationsEnabledNewMessage,
    notificationsEnabledSuperLike,
    notificationsEnabledPromotions,
    receivedSuperLike,
    compatibility,
    notifications,
    numberOfMessageNotifications,
    subscription,
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
    notifications,
    biography,
    boost,
    numberOfLikeNotifications,
    numberOfMessageNotifications,
    maxNumberOfLike,
    dateWhenUserCanSwipeAgain,
    notificationsEnabledNewMatch,
    notificationsEnabledNewMessage,
    notificationsEnabledSuperLike,
    notificationsEnabledPromotions,
    receivedSuperLike,
    subscription,
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
// @route PUT /api/users
// @access Public
const updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  // Find the user by ID
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update the user fields
  user.firstname = updates.firstname || user.firstname;
  user.email = updates.email || user.email;
  user.password = updates.password || user.password; // Make sure to hash the password if it's updated
  user.genre = updates.genre || user.genre;
  user.interestedBy = updates.interestedBy || user.interestedBy;
  user.dateOfBirth = updates.dateOfBirth || user.dateOfBirth;
  user.ageOfInterest = updates.ageOfInterest || user.ageOfInterest;
  user.handicap = updates.handicap || user.handicap;
  user.handicapVisible =
    updates.handicapVisible !== undefined
      ? updates.handicapVisible
      : user.handicapVisible;
  user.profilePicture = updates.profilePicture || user.profilePicture;
  user.expoPushToken = updates.expoPushToken || user.expoPushToken;
  user.biography =
    updates.biography != undefined ? updates.biography : user.biography;
  user.maxNumberOfLike = updates.hasOwnProperty("maxNumberOfLike")
    ? updates.maxNumberOfLike
    : user.maxNumberOfLike;
  user.dateWhenUserCanSwipeAgain =
    updates.dateWhenUserCanSwipeAgain || user.dateWhenUserCanSwipeAgain;
  user.numberOfLikeNotifications =
    updates.numberOfLikeNotifications || user.numberOfLikeNotifications;
  user.pictures = updates.pictures || user.pictures;
  user.boost = updates.boost != undefined ? updates.boost : user.boost;
  user.notificationsEnabledNewMatch =
    updates.notificationsEnabledNewMatch !== undefined
      ? updates.notificationsEnabledNewMatch
      : user.notificationsEnabledNewMatch;
  user.notificationsEnabledNewMessage =
    updates.notificationsEnabledNewMessage !== undefined
      ? updates.notificationsEnabledNewMessage
      : user.notificationsEnabledNewMessage;
  user.notificationsEnabledSuperLike =
    updates.notificationsEnabledSuperLike !== undefined
      ? updates.notificationsEnabledSuperLike
      : user.notificationsEnabledSuperLike;
  user.notificationsEnabledPromotions =
    updates.notificationsEnabledPromotions !== undefined
      ? updates.notificationsEnabledPromotions
      : user.notificationsEnabledPromotions;
  user.receivedSuperLike =
    updates.receivedSuperLike !== undefined
      ? updates.receivedSuperLike
      : user.receivedSuperLike;
  user.compatibility = updates.compatibility || user.compatibility;
  user.notifications = updates.notifications || user.notifications;
  user.numberOfMessageNotifications =
    updates.numberOfMessageNotifications || user.numberOfMessageNotifications;
  user.subscription = updates.subscription || user.subscription;
  // Save the updated user
  const updatedUser = await user.save();

  res.status(200).json(updatedUser);
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

  if (!users) {
    res.status(500).json({ message: "The users were not found" });
  } else {
    res.status(200).send(users);
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

// @desc Get User
// @route GET /api/users/email/:email
// @access Public
const getUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email: email });

  if (!user) {
    res
      .status(404)
      .json({ message: "The user with the given email was not found." });
  } else {
    res.status(200).send(user);
  }

  return;
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

export {
  createUser,
  updateUser,
  emailExists,
  loginUser,
  getUser,
  deleteUser,
  getUsers,
  getUserByEmail,
};
