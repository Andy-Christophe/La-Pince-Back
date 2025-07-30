import { Router } from 'express';
import {
  getAllUtilisateurs,
  createUtilisateur,
  getUtilisateurById,
  updateUtilisateur,
  deleteUtilisateur,
  deleteUtilisateurAccount,
} from '../controllers/utilisateurController.js';
import isLogged from '../middlewares/isLogged.js';

const router = Router();


router.post('/', createUtilisateur);

router.use(isLogged);

router.get('/', getAllUtilisateurs);
router.get('/:id', getUtilisateurById);
router.put('/:id', updateUtilisateur);
router.delete('/account/:id', deleteUtilisateurAccount);
router.delete('/:id', deleteUtilisateur);


export default router;