import User from "../models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken";
import { Request, Response, NextFunction } from "express";

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
    console.log("GOES HERE");
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

// @desc Update user pictures
// @route PUT /api/users/images
// @access Private
const updateImages = asyncHandler(async (req, res) => {
  const { id, imageUrl } = req.body;

  const user = await User.findById(id);

  if (user) {
    user.pictures?.push(imageUrl);
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

// @desc Get User
// @route GET /api/users/:id
// @access Public
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res
      .status(500)
      .json({ message: "The user with the given ID was not found." });
  }
  res.status(200).send(user);
});

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private/admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  console.log("id", req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
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
};
