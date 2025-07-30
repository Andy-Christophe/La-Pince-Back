import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET;

function isAdmin(req, res, next) {
    // 1. D'abord vérifier si on a déjà l'utilisateur (si isLogged a été appelé avant)
    if (req.user) {
        // Utilisateur déjà vérifié par isLogged, on vérifie juste le rôle
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Accès refusé',
                message: 'Accès réservé aux administrateurs'
            });
        }
        return next();
    }

    // 2. Sinon, faire la vérification complète JWT + Admin
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Token manquant',
            message: 'Authentification requise'
        });
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Token invalide',
                message: 'Token expiré ou invalide'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Accès refusé',
                message: 'Accès réservé aux administrateurs'
            });
        }

        req.user = user;
        next();
    });
}

export default isAdmin;