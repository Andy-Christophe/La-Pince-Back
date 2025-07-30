import validator from 'validator';
import bcrypt from 'bcrypt';
import Utilisateur from '../models/Utilisateur.js';

export async function createUserWithValidation(body) {
    const options = { minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 };

    // Validation du mot de passe
    if (!body.mot_de_passe || !validator.isStrongPassword(body.mot_de_passe, options)) {
        throw new Error('Le mot de passe doit comporter au moins 12 caractères et au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial');
    }

    // Validation de l'email
    if (!body.email || !validator.isEmail(body.email)) {
        throw new Error('Email invalide.');
    }
    const email = body.email.trim().toLowerCase();

    // Vérifie si un utilisateur existe déjà avec cet email
    const existingUser = await Utilisateur.findOne({ where: { email } });
    if (existingUser) {
        throw new Error('Cet email est déjà utilisé.');
    }

  // Validation du prénom
    if (!body.prenom || !validator.isLength(body.prenom, { min: 1, max: 50 })) {
        throw new Error("Le prénom est requis (1-50 caractères).");
    }

    // Validation du nom
    if (!body.nom || !validator.isLength(body.nom, { min: 1, max: 50 })) {
        throw new Error("Le nom est requis (1-50 caractères).");
    } 


    // Hash du mot de passe
    const hash = await bcrypt.hash(body.mot_de_passe, 10);

    // Création de l'utilisateur
    return Utilisateur.create({
        email,
        mot_de_passe: hash,
        prenom: body.prenom,
        nom: body.nom,
        image_utilisateur: body.image_utilisateur || null,
        numero_telephone: body.numero_telephone || null,
        role: 'user' 
    });
} 




export { createUserWithValidation as validationRegister };