import { Router } from 'express';
import {
    getAllAlertes,
    createAlerte,
    getAlerteById,
    updateAlerte,
    deleteAlerte
} from '../controllers/alerteController.js';
import isLogged from '../middlewares/isLogged.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = Router();
// Récupérer toutes les alertes (admin uniquement)
router.get('/', getAllAlertes);
// Récupérer une alerte par id (admin uniquement)
router.get('/:id', getAlerteById);




router.use(isLogged, isAdmin);

// Créer une alerte (admin uniquement)
router.post('/', createAlerte);

// Mettre à jour une alerte (admin uniquement)
router.put('/:id', updateAlerte);

// Supprimer une alerte (admin uniquement)
router.delete('/:id', deleteAlerte);

export default router;