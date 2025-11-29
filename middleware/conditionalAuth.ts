import { Request, Response, NextFunction } from "express";
import { authenticate } from "./auth";
import { PUBLIC_ROUTES } from "../constants/publicRoutes";

/**
 * Vérifie si une route est publique
 */
const isPublicRoute = (method: string, path: string): boolean => {
  return PUBLIC_ROUTES.some(
    (route) => route.method === method && route.path === path
  );
};

/**
 * Middleware d'authentification conditionnelle
 * Applique l'authentification sauf pour les routes publiques
 */
export const conditionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const method = req.method;
  // Utiliser originalUrl pour obtenir le chemin complet
  const path = req.originalUrl.split("?")[0]; // Enlever les query params

  // Si la route est publique, passer sans authentification
  if (isPublicRoute(method, path)) {
    return next();
  }

  // Sinon, appliquer l'authentification
  return authenticate(req, res, next);
};

