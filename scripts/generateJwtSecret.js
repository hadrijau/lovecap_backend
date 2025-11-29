const crypto = require('crypto');

// Générer un JWT_SECRET de 64 caractères (256 bits) - sécurisé pour JWT
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('JWT_SECRET généré:');
console.log(jwtSecret);
console.log('\nAjoutez cette ligne à votre fichier .env:');
console.log(`JWT_SECRET=${jwtSecret}`);

