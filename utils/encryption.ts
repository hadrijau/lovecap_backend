import CryptoJS from "crypto-js";

// Clé de chiffrement (doit être dans les variables d'environnement)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-encryption-key-change-in-production";

/**
 * Chiffre un message avec AES
 * @param text - Le texte à chiffrer
 * @returns Le texte chiffré en base64
 */
export const encryptMessage = (text: string): string => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

/**
 * Déchiffre un message chiffré avec AES
 * @param encryptedText - Le texte chiffré en base64
 * @returns Le texte déchiffré
 */
export const decryptMessage = (encryptedText: string): string => {
  if (!encryptedText) return encryptedText;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encryptedText; // Retourne l'original si le déchiffrement échoue (pour compatibilité)
  } catch (error) {
    console.error("Error decrypting message:", error);
    return encryptedText; // Retourne l'original en cas d'erreur
  }
};

