import { Router } from 'express';
import {
    createOperation,
    getOperationById,
    updateOperation,
    deleteOperation,
    getOperationByDate,
    searchOperations,
    getOperations
} from '../controllers/operationController.js';
import {
    getAllOperationsAccount,
    createOperationAccount,
    getOperationByIdAccount,
    updateOperationAccount,
    deleteOperationAccount,
    getOperationByDateAccount,
    getOperationByMonthAccount
} from '../controllers/accountOperationController.js'
import isLogged from '../middlewares/isLogged.js';

const router = Router();

router.use(isLogged);

// -------------------------- ACCOUNT 
 
router.get('/account', getAllOperationsAccount);
router.post('/account', createOperationAccount);
router.get('/account/month', getOperationByMonthAccount);
router.get('/account/getoperationbydate', getOperationByDateAccount);
router.put('/account/:id', updateOperationAccount);
router.get('/account/:id', getOperationByIdAccount);
router.delete('/account/:id', deleteOperationAccount);


// -------------------------- BUDGET

router.get('/budget/search', searchOperations);
router.get('/budget', getOperations);
router.post('/budget', createOperation);
router.get('/budget/getoperationbydate', getOperationByDate);
router.get('/budget/:id', getOperationById);
router.delete('/budget/:id', deleteOperation);

export default router;

