import User from "../models/userModel";
import asyncHandler from "express-async-handler";
import {
  generateTokens,
  generateAccessToken,
  verifyToken,
} from "../utils/generateTokens";
import { Request, Response } from "express";


// @desc Register User
// @route POST /api/users
// @access Public
const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstname } = req.body;

  // Validation des champs critiques
  if (!email || !password || !firstname) {
    res.status(400);
    throw new Error("Veuillez fournir un email, un mot de passe et un prénom");
  }

  try {
    // Créer l'utilisateur - Mongoose gère la validation et l'unicité via le schema
    const user = await User.create(req.body);

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    res.status(201).json({
      _id: user._id,
      email: user.email,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    // Gérer l'erreur d'unicité de l'email
    if (error.code === 11000 && error.keyPattern?.email) {
      res.status(400);
      throw new Error("Un utilisateur avec cet email existe déjà");
    }
    // Relancer les autres erreurs
    throw error;
  }
});

// @desc Login User
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validation des champs requis
  if (!email || !password) {
    res.status(400);
    throw new Error("Veuillez fournir un email et un mot de passe");
  }

  // Recherche de l'utilisateur
  const user = await User.findOne({ email });

  // Utilisation d'un message générique pour éviter l'énumération d'emails
  const isValidPassword = user
    ? await user.matchPassword(password)
    : false;

  if (!user || !isValidPassword) {
    res.status(401);
    throw new Error("Email ou mot de passe incorrect");
  }

  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user._id.toString());

  res.status(200).json({
    user: user.email,
    userId: user._id,
    accessToken,
    refreshToken,
  });
});

// @desc Refresh Access Token
// @route POST /api/users/refresh
// @access Public
const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error("Refresh token requis");
  }

  // Vérifier le refresh token
  const decoded: any = verifyToken(token);

  if (!decoded || decoded.type !== "refresh") {
    res.status(401);
    throw new Error("Refresh token invalide ou expiré");
  }

  // Vérifier que l'utilisateur existe toujours
  const user = await User.findById(decoded.userId);
  if (!user) {
    res.status(401);
    throw new Error("Utilisateur introuvable");
  }

  // Générer un nouveau access token
  const accessToken = generateAccessToken(user._id.toString());

  res.status(200).json({
    accessToken,
  });
});

export { createUser, loginUser, refreshToken };