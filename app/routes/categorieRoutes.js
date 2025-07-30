import { Router } from 'express';
import {
    getAllCategories,
    createCategorie,
    getCategorieById,
    updateCategorie,
    deleteCategorie
} from '../controllers/categorieController.js';
import isLogged from '../middlewares/isLogged.js';

const router = Router();





router.use(isLogged);

router.get('/', getAllCategories);
router.post('/', createCategorie);
router.get('/:id', getCategorieById);
router.put('/:id', updateCategorie);
router.delete('/:id', deleteCategorie);

export default router;