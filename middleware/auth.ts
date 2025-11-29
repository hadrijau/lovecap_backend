import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { verifyToken } from "../utils/generateTokens";
import User from "../models/userModel";

// Étendre l'interface Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

/**
 * Middleware d'authentification qui vérifie le JWT access token
 * Ajoute req.user avec l'ID de l'utilisateur si le token est valide
 */
export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Token d'accès manquant. Format attendu: Bearer <token>" });
      throw new Error("Token d'accès manquant. Format attendu: Bearer <token>");
    }

    // Extraire le token (enlever "Bearer ")
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401);
      throw new Error("Token d'accès manquant");
    }

    // Vérifier et décoder le token
    const decoded: any = verifyToken(token);

    if (!decoded || decoded.type === "refresh") {
      res.status(401).json({ message: "Token invalide ou expiré. Utilisez un access token." });
      throw new Error("Token invalide ou expiré. Utilisez un access token.");
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "Utilisateur introuvable" });
      throw new Error("Utilisateur introuvable");
    }

    // Ajouter l'ID de l'utilisateur à la requête
    req.user = {
      userId: decoded.userId,
    };

    next();
  }
);

