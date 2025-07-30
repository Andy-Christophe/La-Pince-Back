import express from 'express';
import dotenv from 'dotenv';
import './app/database.js';
import router from './app/router.js';
import utilisateurRoutes from './app/routes/utilisateurRoutes.js';
import compteRoutes from './app/routes/compteRoutes.js';
import categorieRoutes from './app/routes/categorieRoutes.js';
import budgetRoutes from './app/routes/budgetRoutes.js';
import operationRoutes from './app/routes/operationRoutes.js';
import alerteRoutes from './app/routes/alerteRoutes.js';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';



dotenv.config();


// Configuration Cloudinary pour les images
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  secure: true,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});



export { cloudinary };

//-------------------------------------------------------

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
  origin: [
    'http://localhost:1234',
    'https://lapinceisfront.vercel.app'
  ], // URL DU FRONT
  credentials: true
}));

//--------------------------------------------------------------------------------------


// Branche chaque groupe de routes sur un préfixe d'URL
app.use('/utilisateurs', utilisateurRoutes);
app.use('/comptes', compteRoutes);
app.use('/categories', categorieRoutes);
app.use('/budgets', budgetRoutes);
app.use('/operations', operationRoutes);
app.use('/alertes', alerteRoutes);

app.use('/', router);


// Importation des routes


app.use((req, res) => {
  res.status(404).json({ success: false, message: "La page demandée n'a pas été trouvée." });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});