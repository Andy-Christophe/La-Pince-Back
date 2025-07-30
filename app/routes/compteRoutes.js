import { Router } from 'express';
import {
    getAllComptes,
    createCompte,
    getCompteById,
    updateCompte,
    deleteCompte,
    getCompteByUserId
} from '../controllers/compteController.js';
import isLogged from '../middlewares/isLogged.js';

const router = Router();

router.use(isLogged);


router.get('/', getAllComptes);
router.post('/', createCompte);
router.get('/getcomptebyuserid', getCompteByUserId);
router.get('/:id', getCompteById);
router.put('/:id', updateCompte);
router.delete('/:id', deleteCompte);


export default router;