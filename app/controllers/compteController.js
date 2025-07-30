import validator from 'validator';
import { Compte } from '../models/associations.js';
import e from 'express';


export async function createCompte(req, res) {
  try {
    const existingCompte = await Compte.findOne({
      where: { utilisateurId: req.user.id }
    });

    if (existingCompte) {
      return res.status(401).json({
        success: false,
        error: 'Vous avez déjà un compte créé. Un seul compte par utilisateur est autorisé.'
      });
    }

    const { nom_compte, banque, devise, solde_initial } = req.body;

    if (!nom_compte || !validator.isLength(nom_compte, { min: 1, max: 50 })) {
      return res.status(402).json({ error: 'Le nom du compte est requis (1-50 caractères).' });
    }

    if (!banque || !validator.isLength(banque, { min: 1, max: 50 })) {
      return res.status(403).json({ error: 'Le nom de la banque est requis (1-50 caractères).' });

    }

    if (!solde_initial || !validator.isNumeric(solde_initial)) {
      return res.status(404).json({ error: 'Le solde initial est requis et doit être un nombre.' });
    }

    const createCompte = await Compte.create({
      nom_compte,
      banque,
      devise,
      solde_initial,
      utilisateurId: req.user.id,
      solde_courant: solde_initial
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: createCompte
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      error: "Errrreeeuuurrrrr"
    });
  }
}
// --------------------------------------------------------------------

// Récupère tous les comptes
export async function getAllComptes(req, res) {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    const comptes = await Compte.findAll();
    res.json(comptes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------------------------------------------------------

// Récupère un compte par son id
export async function getCompteById(req, res) {
  try {
    const compte = await Compte.findByPk(req.params.id);
    if (!compte) return res.status(404).json({ error: 'Compte non trouvé' });
    res.json(compte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------------------------------------------------------

// Modifie un compte
export async function updateCompte(req, res) {
  try {
    const { id } = req.params;
    const { nom_compte, banque, devise } = req.body;

    const compte = await Compte.findByPk(id);
    if (!compte) return res.status(404).json({ error: 'Compte non trouvé' });

    await compte.update({ nom_compte, banque, devise, solde_initial });
    res.json(compte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// --------------------------------------------------------------------

export async function deleteCompte(req, res) {
  try {
    const { id } = req.params;
    const compte = await Compte.findByPk(id);
    if (!compte) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }
    await compte.destroy();
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// --------------------------------------------------------------------

export async function getCompteByUserId(req, res) {
  try {
    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id }
    });

    if (!compte) {
      return res.status(404).json({ error: 'Aucun compte trouvé pour cet utilisateur.' });
    }

    res.json(compte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}