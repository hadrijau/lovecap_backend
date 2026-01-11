import User from "../models/userModel";
import asyncHandler from "express-async-handler";
import {
  generateTokens,
  generateAccessToken,
  verifyToken,
} from "../utils/generateTokens";
import { Request, Response } from "express";
import crypto from "crypto";
import sendinblue from "../utils/sendEmail";


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

// @desc Request password reset
// @route POST /api/users/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Veuillez fournir un email");
  }

  // Recherche de l'utilisateur
  const user = await User.findOne({ email });

  // Message générique pour éviter l'énumération d'emails
  if (!user) {
    res.status(200).json({
      message: "Si cet email existe, un code de vérification a été envoyé",
    });
    return;
  }

  // Générer un code à 6 chiffres
  const resetCode = crypto.randomInt(100000, 999999).toString();

  // Définir l'expiration à 15 minutes
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 15);

  // Enregistrer le code et l'expiration
  user.resetPasswordCode = resetCode;
  user.resetPasswordExpires = expires;
  await user.save();

  // Envoyer l'email avec le code
  try {
    await sendinblue({
      to: [{ email }],
      subject: "Réinitialisation de votre mot de passe Love&Cap",
      htmlContent: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1E388C;">Réinitialisation de votre mot de passe</h2>
            <p>Bonjour,</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe Love&Cap.</p>
            <p>Voici votre code de vérification :</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h1 style="color: #48BBC1; letter-spacing: 5px; margin: 0;">${resetCode}</h1>
            </div>
            <p>Ce code est valable pendant 15 minutes.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            <p style="margin-top: 30px;">L'équipe Love&Cap</p>
          </body>
        </html>
      `,
      sender: { email: "dev.lovecap@gmail.com", name: "Love&Cap" },
    });
    console.log(`Email envoyé à ${email} avec le code: ${resetCode}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    // On ne révèle pas l'erreur à l'utilisateur pour des raisons de sécurité
  }

  res.status(200).json({
    message: "Si cet email existe, un code de vérification a été envoyé",
  });
});

// @desc Verify reset code and generate access token
// @route POST /api/users/verify-confirmation
// @access Public
const verifyResetCode = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    res.status(400);
    throw new Error("Veuillez fournir un email et un code");
  }

  // Recherche de l'utilisateur
  const user = await User.findOne({ email });

  if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
    res.status(400);
    throw new Error("Code invalide ou expiré");
  }

  // Vérifier si le code a expiré
  if (new Date() > user.resetPasswordExpires) {
    // Supprimer le code expiré
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(400);
    throw new Error("Code expiré");
  }

  // Vérifier le code
  if (user.resetPasswordCode !== code) {
    res.status(400);
    throw new Error("Code invalide");
  }

  // Code valide : supprimer le code et générer un access token
  user.resetPasswordCode = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // Générer un access token
  const accessToken = generateAccessToken(user._id.toString());

  res.status(200).json({
    message: "Code vérifié avec succès",
    accessToken,
    userId: user._id,
  });
});

export { createUser, loginUser, refreshToken, forgotPassword, verifyResetCode };