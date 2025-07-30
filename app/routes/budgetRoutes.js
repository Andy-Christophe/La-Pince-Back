import { Router } from 'express';
import {
    getAllBudgets,
    createBudget,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getUserBudgets
} from '../controllers/budgetController.js';
import isLogged from '../middlewares/isLogged.js';

const router = Router();

router.use(isLogged);

// Récupérer les budgets de l'utilisateur
router.get('/user', getUserBudgets);

// Récupérer tous les budgets
router.get('/', getAllBudgets);

// Créer un budget
router.post('/', createBudget);

// Récupérer un budget par id
router.get('/:id', getBudgetById);

// Mettre à jour un budget
router.put('/:id', updateBudget);

// Supprimer un budget
router.delete('/:id', deleteBudget);

export default router;