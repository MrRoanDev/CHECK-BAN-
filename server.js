const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour permettre les styles et scripts dynamiques
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques depuis le dossier actuel
app.use(express.static(__dirname));

// Route principale
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>MR ROAN - Ban Checker</title>
                <meta charset="UTF-8">
                <style>
                    body {
                        background: #06080e;
                        color: #aabfd4;
                        font-family: monospace;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .error {
                        text-align: center;
                        padding: 20px;
                        background: rgba(255,34,68,.1);
                        border: 1px solid rgba(255,34,68,.3);
                        border-radius: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>❌ Erreur</h1>
                    <p>Le fichier index.html est introuvable.</p>
                    <p>Assurez-vous qu'il se trouve dans le même dossier que server.js</p>
                </div>
            </body>
            </html>
        `);
    }
});

// Route API proxy pour la vérification (optionnelle - contourne CORS)
app.post('/api/check', async (req, res) => {
    try {
        const { number } = req.body;
        
        if (!number) {
            return res.status(400).json({ error: 'Numéro requis' });
        }
        
        const response = await fetch('https://baron0.com/api/external/check', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'MR-ROAN-Checker/1.0'
            },
            body: JSON.stringify({ number })
        });
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('[API ERROR]', error.message);
        // En cas d'erreur, renvoyer une réponse simulée
        res.json({ 
            banned: false, 
            reason: null,
            message: 'API temporairement indisponible'
        });
    }
});

// Route santé pour monitoring
app.get('/health', (req, res) => {
    res.json({ 
        status: 'online', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        author: 'MR ROAN SMK'
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🔥 MR ROAN SMK - ANTI-P BAN CHECKER 🔥                        ║
║                                                                   ║
║     ⚡ Serveur démarré sur http://localhost:${PORT}                 ║
║     ⚡ Interface accessible sur http://localhost:${PORT}           ║
║                                                                   ║
║     📱 WhatsApp Checker - La mort n'est que le début              ║
║     👑 Développé par MR ROAN SMK                                  ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
    console.log('\n\n🛑 Serveur arrêté proprement');
    process.exit(0);
});
