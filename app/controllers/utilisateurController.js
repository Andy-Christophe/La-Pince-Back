import { Utilisateur, Compte, Operation, Budget } from '../models/associations.js'; import validator from 'validator';
import bcrypt from 'bcrypt';
import { createUserWithValidation } from '../utils/validationRegister.js';
import sequelize from '../database.js';



const utilisateurController = {
  profile: async function (req, res) {
    try {
      // Using user ID from JWT (more efficient):
      const user = await Utilisateur.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }

      res.json({
        success: true,
        utilisateur: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone,
          date_naissance: user.date_naissance
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },
};
// -----------------------------------------------------------



export async function createUtilisateur(req, res) {
  try {

    const utilisateur = await createUserWithValidation(req.body);
    res.status(201).json(utilisateur);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// -----------------------------------------------------------

export async function getAllUtilisateurs(req, res) {
  console.log("getAllUtilisateurs called");
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    const utilisateurs = await Utilisateur.findAll();
    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// -----------------------------------------------------------

export async function getUtilisateurById(req, res) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// -----------------------------------------------------------

export async function updateUtilisateur(req, res) {
  try {
    const { id } = req.params;
    let { email, mot_de_passe, prenom, nom, numero_telephone, image_utilisateur, role } = req.body;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Validation des champs (si présents)
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ error: "Email invalide." });
    }
    if (mot_de_passe && !validator.isStrongPassword(mot_de_passe, { minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
      return res.status(400).json({ error: "Le mot de passe doit comporter au moins 12 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial." });
    }
    if (prenom && !validator.isLength(prenom, { min: 1, max: 100 })) {
      return res.status(400).json({ error: "Le prénom doit faire 1 à 100 caractères." });
    }
    if (nom && !validator.isLength(nom, { min: 1, max: 100 })) {
      return res.status(400).json({ error: "Le nom doit faire 1 à 100 caractères." });
    }
    if (
      numero_telephone &&
      !validator.isLength(numero_telephone, { min: 6, max: 20 }) // longueur raisonnable
    ) {
      return res.status(400).json({ error: "Le numéro de téléphone doit faire entre 6 et 20 caractères." });
    }
    if (
      numero_telephone &&
      !validator.isNumeric(numero_telephone)
    ) {
      return res.status(400).json({ error: "Le numéro de téléphone doit contenir uniquement des chiffres." });
    }
    // Hash du mot de passe si modifié
    if (mot_de_passe) {
      mot_de_passe = await bcrypt.hash(mot_de_passe, 10);
    }

    await utilisateur.update({
      email,
      mot_de_passe,
      prenom,
      nom,
      numero_telephone,
      image_utilisateur,
      role
    });

    res.json(utilisateur);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// -----------------------------------------------------------

export async function deleteUtilisateur(req, res) {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await utilisateur.destroy();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default utilisateurController;



// ----------------------------------------------------------


export async function deleteUtilisateurAccount(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id, { transaction });
    if (!utilisateur) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer tous les comptes de l'utilisateur
    const comptes = await Compte.findAll({ where: { utilisateurId: id }, transaction });

    for (const compte of comptes) {
      // Supprimer les opérations du compte
      await Operation.destroy({ where: { compteId: compte.id }, transaction });
      // Supprimer les budgets du compte
      await Budget.destroy({ where: { compteId: compte.id }, transaction });
    }

    // Supprimer les comptes de l'utilisateur
    await Compte.destroy({ where: { utilisateurId: id }, transaction });

    // Supprimer l'utilisateur
    await utilisateur.destroy({ transaction });

    await transaction.commit();
    res.json({ message: 'Utilisateur et ses données associées supprimés avec succès' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
}