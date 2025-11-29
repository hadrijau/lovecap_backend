import { Request, Response, NextFunction } from "express";

/**
 * Middleware de logging qui enregistre toutes les requêtes et leurs réponses
 * S'exécute après la requête pour capturer le code de statut
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Capturer le code de statut et le temps de réponse
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    const log = {
      timestamp,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get("user-agent") || "unknown",
    };

    // Codes de couleur ANSI
    const RESET = "\x1b[0m";
    const RED = "\x1b[31m";
    const YELLOW = "\x1b[33m";
    const GREEN = "\x1b[32m";
    const BLUE = "\x1b[34m";
    const CYAN = "\x1b[36m";
    const GRAY = "\x1b[90m";

    // Log avec couleur selon le code de statut
    if (res.statusCode >= 500) {
      // Rouge pour les erreurs serveur
      console.error(
        `${RED}[${log.timestamp}]${RESET} ${CYAN}${log.method}${RESET} ${log.url} ${RED}- ${log.statusCode}${RESET} ${GRAY}- ${log.duration}${RESET}`
      );
    } else if (res.statusCode >= 400) {
      // Jaune pour les erreurs client
      console.warn(
        `${YELLOW}[${log.timestamp}]${RESET} ${CYAN}${log.method}${RESET} ${log.url} ${YELLOW}- ${log.statusCode}${RESET} ${GRAY}- ${log.duration}${RESET}`
      );
    } else {
      // Vert pour les succès
      console.log(
        `${GREEN}[${log.timestamp}]${RESET} ${CYAN}${log.method}${RESET} ${log.url} ${GREEN}- ${log.statusCode}${RESET} ${GRAY}- ${log.duration}${RESET}`
      );
    }
  });

  next();
};

