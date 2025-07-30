import express from 'express';
import mainController from './controllers/mainController.js';
import websiteController from './controllers/websiteController.js';
import authController from './controllers/authController.js';
import utilisateurController from './controllers/utilisateurController.js';
import isLogged from './middlewares/isLogged.js';


const router = express.Router();


router.get('/', mainController.home);

router.get('/legal', mainController.legal);
router.get('/about', mainController.about);
router.get('/contact', mainController.contact);
router.get('/dashboard', isLogged, mainController.dashboard);
router.get('/account', isLogged, mainController.account);

router.get('/login', authController.login);
router.post('/login', authController.loginAction);
router.get('/register', authController.signup);
router.post('/register', authController.signupAction);
router.post('/logout', isLogged, authController.logout);
router.post('/forgot-password', authController.logout);
router.post('/reset-password', authController.logout);

router.get('/profile', isLogged, utilisateurController.profile);
router.put('/profile', isLogged, utilisateurController.profile);
router.put('/preferences', isLogged, utilisateurController.profile);
router.delete('/id', isLogged, utilisateurController.profile);


router.get('/overview', isLogged, websiteController.overview);
router.get('/operations/stats', isLogged, websiteController.stats);
router.get('/categories', isLogged, websiteController.categories);

router.use(mainController.notFound);

export default router;