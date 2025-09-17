// debug-server.js
console.log('🔍 Démarrage du debug...');

try {
    console.log('1. Chargement d\'express...');
    const express = require('express');
    console.log('✅ Express chargé');
    
    console.log('2. Création de l\'app...');
    const app = express();
    console.log('✅ App créée');
    
    console.log('3. Configuration middleware...');
    app.use(express.json());
    console.log('✅ Middleware configuré');
    
    console.log('4. Ajout des routes...');
    app.get('/test', (req, res) => {
        console.log('✅ Route /test appelée');
        res.json({ message: 'Ça marche!' });
    });
    console.log('✅ Routes ajoutées');
    
    console.log('5. Démarrage du serveur...');
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log('===================================');
        console.log('✅ SERVEUR DÉMARRÉ AVEC SUCCÈS!');
        console.log('===================================');
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log('===================================');
    });
    
} catch (error) {
    console.error('💥 ERREUR:', error.message);
    console.error('Stack:', error.stack);
}