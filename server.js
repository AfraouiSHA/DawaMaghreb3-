// backend/server.js - VERSION CORRIGÉE COMPLÈTE (même structure, erreurs corrigées)

require('dotenv').config();
const sharp = require('sharp');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const fileTypeLib = require('file-type');

const app = express();
const PORT = process.env.PORT || 3000;

// 🧱 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 📁 Dossiers locaux
const documentsDir = path.join(__dirname, 'documents');
const excelUploadsDir = path.join(__dirname, 'excel-uploads');
[documentsDir, excelUploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 🖼️ Fichiers statiques
app.use('/documents', express.static(documentsDir));
app.use('/excel-uploads', express.static(excelUploadsDir));

// 📎 Multer (10MB max)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

// 🔐 Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const SUPABASE_BUCKET_SIGNED_PVS = process.env.SUPABASE_BUCKET_SIGNED_PVS || 'signed-pvs';
const SUPABASE_BUCKET_SIGNATURES = process.env.SUPABASE_BUCKET_SIGNATURES || 'signatures';
const SUPABASE_BUCKET_EXCEL = process.env.SUPABASE_BUCKET_EXCEL || 'excel';

let supabase = null;
if (supabaseUrl && supabaseKey) {
    console.log('✅ Connexion Supabase en cours d’initialisation...');
    supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
    });
} else {
    console.warn('⚠️ Attention: Variables Supabase manquantes.');
}

// ✅ Test connexion
async function testSupabaseConnection() {
    if (process.env.SIMULATION_MODE) {
        console.log('⚠️ Mode simulation: connexion non testée.');
        return;
    }
    try {
        const { error } = await supabase.from('fournisseurs').select('count');
        if (error) console.warn('⚠️ Problème connexion Supabase:', error.message);
        else console.log('✅ Connexion Supabase OK');
    } catch (err) {
        console.warn('⚠️ Impossible de tester Supabase:', err.message);
    }
}

// 📌 Routes de base
app.get('/api/test', (req, res) => res.send('API is running!'));
app.get('/', (req, res) => res.send('Le serveur backend est opérationnel !'));
app.get('/api/health', (req, res) => res.json({ status: 'OK', port: PORT }));

// ✅ Route soumission corrigée
app.post('/api/soumission', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ success: false, error: 'Service non disponible.' });
    }

    try {
        const {
            
            nomEntreprise,
            adresse,
            telephone,
            email,
            compteBancaire,
            taxeProfessionnelle,
            ice,
            cnss,
            documents_techniques,
            documents_administratifs,
            objetAO,
            dateLimite,
            refAO,
            acceptConditions,
            devisData,
            totalHT,
            tvaAmount,
            totalTTC,
            userEmail
        } = req.body;

        const { data: fournisseurData, error: fournisseurError } = await supabase
            .from('fournisseurs')
            .upsert({
                
                nom_entreprise: nomEntreprise,
                adresse,
                telephone,
                email,
                compte_bancaire: compteBancaire,
                taxe_professionnelle: taxeProfessionnelle,
                ice,
                cnss,
                documents_techniques: documents_techniques,
                documents_administratifs: documents_administratifs,
                acceptConditions: acceptConditions,
                devis_data: JSON.stringify(devisData),
                total_ht: totalHT,
                tva_amount: tvaAmount,
                total_ttc: totalTTC,
                numeroAO: refAO,
                 dateLimite: dateLimite,
        objet: objetAO,
                user_email: userEmail
            }, {
                onConflict: 'email',
                ignoreDuplicates: false
            })
            .select();

        if (fournisseurError) {
            console.error('❌ Erreur upsert:', fournisseurError);
            return res.status(500).json({ success: false, error: 'Erreur enregistrement.' });
        }

        res.json({
            success: true,
            message: 'Soumission enregistrée avec succès',
            data: { fournisseur: fournisseurData[0] }
        });

    } catch (error) {
        console.error('💥 Erreur complète:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Erreur serveur interne', details: error.message });
        }
    }
});

// 🎯 ALGORITHME CALIBRÉ 96% transparent
async function removeSignatureBackground96Percent(imageBuffer) {
    try {
        const image = sharp(imageBuffer);
        const { width, height } = await image.metadata();
        const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        const processedData = Buffer.alloc(data.length);
        const luminosityData = [];

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
            luminosityData.push({ luminosity, r, g, b, index: i });
        }

        luminosityData.sort((a, b) => a.luminosity - b.luminosity);
        const targetSignaturePixels = Math.floor(luminosityData.length * 0.04);
        const signatureIndices = new Set();

        for (let i = 0; i < targetSignaturePixels; i++) {
            const p = luminosityData[i];
            if (p.r < 160 && p.g < 160 && p.b < 160) {
                signatureIndices.add(p.index);
            }
        }

        for (let i = 0; i < data.length; i += 4) {
            const isSignature = signatureIndices.has(i);
            processedData[i] = isSignature ? Math.max(0, data[i] - 40) : 0;
            processedData[i + 1] = isSignature ? Math.max(0, data[i + 1] - 40) : 0;
            processedData[i + 2] = isSignature ? Math.max(0, data[i + 2] - 40) : 0;
            processedData[i + 3] = isSignature ? 255 : 0;
        }

        const resultBuffer = await sharp(processedData, {
            raw: { width, height, channels: 4 }
        }).png({ compressionLevel: 9 }).toBuffer();

        return { arrayBuffer: () => Promise.resolve(resultBuffer.buffer) };
    } catch (error) {
        throw new Error(`Algorithme échoué: ${error.message}`);
    }
}


// 🖼️ POST /api/remove-image-background (ALGORITHME CALIBRÉ 96% TRANSPARENT)
app.post('/api/remove-image-background', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier.' });

        const originalBuffer = req.file.buffer;
        const detectedType = await fileTypeLib.fileTypeFromBuffer(originalBuffer);
        if (!detectedType?.mime.startsWith('image/')) {
            return res.status(400).json({ message: 'Format invalide.' });
        }

        if (originalBuffer.length > 5 * 1024 * 1024) {
            return res.status(400).json({ message: 'Image trop lourde.' });
        }

        const preparedBuffer = await sharp(originalBuffer)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .png()
            .toBuffer();

        const resultBlob = await removeSignatureBackground96Percent(preparedBuffer);
        const processedBuffer = Buffer.from(await resultBlob.arrayBuffer());

        res.set({
            'Content-Type': 'image/png',
            'Content-Length': processedBuffer.length,
            'Cache-Control': 'no-cache'
        });
        res.send(processedBuffer);
    } catch (error) {
        console.error('🚨 Erreur:', error);
        res.status(500).json({ message: 'Erreur interne', error: error.message });
    }
});

// 📄 Autres routes : Supabase, Excel, Documents
app.post('/api/upload-signed-pv', async (req, res) => {
    try {
        const { fileName, pdfData, pdfHash, userId } = req.body;
        if (!fileName || !pdfData || !pdfHash) return res.status(400).json({ error: 'Champs manquants' });

        const pdfBuffer = Buffer.from(pdfData, 'base64');
        const filePath = `signed-pvs/${uuidv4()}_${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(SUPABASE_BUCKET_SIGNED_PVS)
            .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(SUPABASE_BUCKET_SIGNED_PVS)
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase
            .from('pv_signatures')
            .insert([{ file_name: fileName, file_url: publicUrl, file_hash: pdfHash, user_id: userId }]);

        if (dbError) throw dbError;

        res.json({ success: true, fileUrl: publicUrl, hash: pdfHash });
    } catch (error) {
        console.error('❌ Upload PV:', error);
        res.status(500).json({ error: 'Échec upload', details: error.message });
    }
});

app.post('/api/upload-processed-signature', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Aucune image' });

        const fileName = `signatures/${uuidv4()}_${req.file.originalname}`;
        const { error: uploadError } = await supabase.storage
            .from(SUPABASE_BUCKET_SIGNATURES)
            .upload(fileName, req.file.buffer, { contentType: 'image/png', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(SUPABASE_BUCKET_SIGNATURES)
            .getPublicUrl(fileName);

        if (req.body.userId) {
            await supabase.from('user_signatures').insert([{
                user_id: req.body.userId,
                signature_url: publicUrl,
                file_name: req.file.originalname
            }]);
        }

        res.json({ success: true, fileUrl: publicUrl });
    } catch (error) {
        console.error('❌ Upload signature:', error);
        res.status(500).json({ error: 'Échec upload', details: error.message });
    }
});

app.post('/api/upload-excel-template', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });

        const filePath = `templates/${req.file.originalname}`;
        const { error } = await supabase.storage
            .from(SUPABASE_BUCKET_EXCEL)
            .upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(SUPABASE_BUCKET_EXCEL)
            .getPublicUrl(filePath);

        res.json({ success: true, fileName: req.file.originalname, fileUrl: publicUrl });
    } catch (error) {
        console.error('❌ Upload Excel:', error);
        res.status(500).json({ error: 'Échec upload', details: error.message });
    }
});

app.get('/api/excel-templates', async (req, res) => {
    try {
        const { data, error } = await supabase.storage.from(SUPABASE_BUCKET_EXCEL).list('templates');
        if (error) throw error;

        const templates = data.map(item => ({
            name: item.name,
            url: supabase.storage.from(SUPABASE_BUCKET_EXCEL).getPublicUrl(`templates/${item.name}`).data.publicUrl
        }));

        res.json(templates);
    } catch (error) {
        console.error('❌ List templates:', error);
        res.status(500).json({ error: 'Erreur récupération', details: error.message });
    }
});

// ✅ Démarrage serveur
testSupabaseConnection();
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    console.log(`🖼️ POST /api/remove-image-background (ALGORITHME CALIBRÉ 96% TRANSPARENT)`);
    console.log(`📄 Autres routes : Supabase, Excel, Documents`);
});
