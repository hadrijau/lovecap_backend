import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET n'est pas défini dans les variables d'environnement");
}

// Génère un access token (15 minutes)
export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "15m",
  });
};

// Génère un refresh token (30 jours)
export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId, type: "refresh" }, JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Génère les deux tokens
export const generateTokens = (userId: string) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
};

// Vérifie et décode un token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

