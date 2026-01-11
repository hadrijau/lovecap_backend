import rateLimit from "express-rate-limit";

// Rate limiter pour la connexion (login)
// Limite à 5 tentatives par 15 minutes pour éviter les attaques brute force
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    error: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
  },
  standardHeaders: true, // Retourne les infos de rate limit dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies (connexion)
});

// Rate limiter pour l'inscription
// Limite à 5 créations de compte par heure par IP pour éviter le spam
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 créations max
  message: {
    error: "Trop de tentatives d'inscription. Veuillez réessayer dans 1 heure.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Rate limiter pour la vérification d'email
// Limite à 10 requêtes par minute pour éviter l'énumération d'emails
export const emailCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requêtes max
  message: {
    error: "Trop de requêtes. Veuillez réessayer dans 1 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies (email existe)
});

// Rate limiter pour l'envoi d'emails
// Limite à 5 envois par heure par IP pour éviter le spam
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 envois max
  message: {
    error: "Trop de tentatives d'envoi d'email. Veuillez réessayer dans 1 heure.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Rate limiter général pour les routes publiques sensibles
// Limite à 100 requêtes par 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
  message: {
    error: "Trop de requêtes. Veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour la demande de réinitialisation de mot de passe
// Limite à 3 tentatives par heure pour éviter le spam
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 tentatives max
  message: {
    error: "Trop de demandes de réinitialisation. Veuillez réessayer dans 1 heure.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour la vérification du code de réinitialisation
// Limite à 5 tentatives par 15 minutes pour éviter le brute force
export const verifyResetCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: {
    error: "Trop de tentatives de vérification. Veuillez réessayer dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
