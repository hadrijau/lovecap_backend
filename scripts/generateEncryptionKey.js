const crypto = require('crypto');

// Générer une clé de 64 caractères (512 bits) - très sécurisée
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log(encryptionKey);
console.log(`ENCRYPTION_KEY=${encryptionKey}\n`);

