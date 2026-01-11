/**
 * Liste des routes publiques (pas d'authentification requise)
 * Format: { method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string }
 */
export const PUBLIC_ROUTES = [
  { method: "POST" as const, path: "/api/users" }, // Créer un utilisateur
  { method: "POST" as const, path: "/api/users/login" }, // Connexion
  { method: "POST" as const, path: "/api/users/refresh" }, // Rafraîchir le token
  { method: "GET" as const, path: "/" }, // Hello World
  { method: "POST" as const, path: "/api/users/forgot-password" }, // Demander un code de réinitialisation de mot de passe
  { method: "POST" as const, path: "/api/users/verify-confirmation" }, // Vérifier le code de réinitialisation de mot de passe
] as const;

