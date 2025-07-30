import { Operation, Compte, Categorie } from '../models/associations.js';
import validator from 'validator';
import { cloudinary } from '../../index.js';
import { Op } from 'sequelize';

export async function createOperation(req, res) {
  try {
    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id }
    });
    if (!compte) {
      return res.status(404).json({
        success: false,
        message: 'Compte non trouvé pour l\'utilisateur.'
      });
    }

    const { montant_operation, nom_operation, moyen_paiement, lieu, categorieId, date_operation, type_operation } = req.body;

    if (!montant_operation || !validator.isDecimal(montant_operation.toString()) && montant_operation === 0) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { montant: 'Le montant de l\'opération doit être un nombre décimal.' }
      });
    }
    if (!nom_operation || !validator.isLength(nom_operation, { min: 1, max: 150 })) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { nom: 'Le nom de l\'opération doit faire 1 à 150 caractères.' }
      });
    }
    if (!moyen_paiement || !validator.isLength(moyen_paiement, { min: 1, max: 30 })) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { moyen_paiement: 'Le moyen de paiement doit faire 1 à 30 caractères.' }
      });
    }

    if (!validator.isLength(lieu, { min: 1, max: 100 })) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { lieu: "Le lieu n'est pas reconnu" }
      });
    }
    if (!categorieId) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { categorie: 'La catégorie est requise.' }
      });
    }

    const categorie = await Categorie.findByPk(categorieId);
    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée.'
      });
    }

    if (!validator.isISO8601(date_operation)) { // date en format international (pour coller au front)
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { date: 'La date de l\'opération doit être une date valide.' }
      });
    }

    if (type_operation != 'revenu' && type_operation != 'depense') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { type: "L'opération n'est pas valide" }
      });
    }

    const operation = await Operation.create({
      montant_operation,
      nom_operation,
      moyen_paiement,
      lieu,
      date_operation,
      type_operation,
      compteId: compte.id,
      categorieId
    });

    res.status(201).json({
      success: true,
      message: 'Opération créée avec succès',
      operation: {
        id: operation.id.toString(),
        libelle: operation.nom_operation,
        price: parseFloat(operation.montant_operation),
        date: formatDate(operation.date_operation),
        lieu: operation.lieu || "NON SPÉCIFIÉ",
        categorie: categorie.nom_categorie,
        type: operation.type_operation,
        moyen_paiement: operation.moyen_paiement
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'opération",
      error: error.message
    });
  }
}

// --------------------------------------------------------------------

export async function getOperationById(req, res) {
  try {
    const operation = await Operation.findByPk(req.params.id, {
      include: [{
        model: Categorie,
        attributes: ['id', 'nom_categorie']
      }, {
        model: Compte,
        attributes: ['utilisateurId']
      }]
    });

    // CHECK IF EXISTS FIRST!
    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Opération non trouvée'
      });
    }

    // CHECK OWNERSHIP
    if (operation.Compte.utilisateurId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette opération'
      });
    }

    res.json({
      success: true,
      operation: {
        id: operation.id.toString(),
        libelle: operation.nom_operation,
        price: parseFloat(operation.montant_operation),
        date: formatDate(operation.date_operation),
        lieu: operation.lieu || "NON SPÉCIFIÉ",
        categorie: operation.Categorie?.nom_categorie || "Autre",
        type: operation.type_operation,
        moyen_paiement: operation.moyen_paiement
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'opération",
      error: error.message
    });
  }
}

// --------------------------------------------------------------------
export async function updateOperation(req, res) {
  try {
    const { id } = req.params;
    const { montant_operation, nom_operation, date_modification, moyen_paiement, lieu, compteId, categorieId, date_operation } = req.body;

    // SECURITY: Find operation with compte info
    const operation = await Operation.findByPk(id, {
      include: [{
        model: Compte,
        attributes: ['utilisateurId']
      }]
    });

    // CHECK IF EXISTS FIRST!
    if (!operation) {
      return res.status(404).json({
        success: false,
        message: "Opération non trouvée"
      });
    }

    // CHECK OWNERSHIP
    if (operation.Compte.utilisateurId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette opération'
      });
    }


    // Validation des champs (seulement si présents dans le body)
    if (montant_operation !== undefined && !validator.isDecimal(montant_operation.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { montant: "Le montant de l'opération doit être un nombre décimal." }
      });
    }
    if (nom_operation !== undefined && !validator.isLength(nom_operation, { min: 1, max: 100 })) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { nom: "Le nom de l'opération doit faire 1 à 100 caractères." }
      });
    }
    if (date_modification !== undefined && !validator.isISO8601(date_modification)) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { date_modification: "La date de modification doit être une date valide." }
      });
    }
    if (moyen_paiement !== undefined && !validator.isLength(moyen_paiement, { min: 1, max: 50 })) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { moyen_paiement: "Le moyen de paiement doit faire 1 à 50 caractères." }
      });
    }
    if (lieu !== undefined && !validator.isLength(lieu, { min: 1, max: 100 })) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { lieu: "Le lieu doit faire 1 à 100 caractères." }
      });
    }
    if (compteId !== undefined && !validator.isInt(compteId.toString(), { min: 1 })) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { compteId: "Le compte associé doit être un entier positif." }
      });
    }
    if (categorieId !== undefined && !validator.isInt(categorieId.toString(), { min: 1 })) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { categorieId: "La catégorie associée doit être un entier positif." }
      });
    }
    if (date_operation && !validator.isISO8601(date_operation)) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { date_operation: 'La date de l\'opération doit être une date valide.' }
      });
    }

    // Mise à jour de l'opération
    await operation.update({
      montant_operation,
      nom_operation,
      date_modification,
      moyen_paiement,
      lieu,
      date_operation,
      compteId,
      categorieId
    });

    res.status(200).json({
      success: true,
      message: 'Opération modifiée avec succès'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: { global: error.message }
    });
  }
}

// --------------------------------------------------------------------

export async function deleteOperation(req, res) {
  try {
    const { id } = req.params;

    // ADD SECURITY: Find operation with compte info
    const operation = await Operation.findByPk(id, {
      include: [{
        model: Compte,
        attributes: ['utilisateurId']
      }]
    });

    // CHECK IF EXISTS FIRST!
    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Opération non trouvée'
      });
    }

    // CHECK OWNERSHIP
    if (operation.Compte.utilisateurId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à cette opération'
      });
    }

    await operation.destroy();

    res.json({
      success: true,
      message: 'Opération supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
}

// --------------------------------------------------------------------

export async function getOperationByDate(req, res) {
  try {
    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id }
    });

    if (!compte) {
      return res.status(404).json({
        success: false,
        message: 'Compte non trouvé pour l\'utilisateur'
      });
    }

    const { date_operation } = req.body;

    if (!date_operation) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { date: 'La date est requise.' }
      });
    }

    if (!validator.isISO8601(date_operation)) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: { date: 'Format de date invalide. Utilisez le format ISO8601.' }
      });
    }

    const operations = await Operation.findAll({
      where: {
        compteId: compte.id,
        date_operation: date_operation
      },
      include: [
        {
          model: Categorie,
          attributes: ['nom_categorie']
        }
      ],
      order: [['date_operation', 'DESC']]
    });

    const formattedOperations = operations.map(operation => ({
      id: operation.id.toString(),
      libelle: operation.nom_operation,
      price: parseFloat(operation.montant_operation),
      date: formatDate(operation.date_operation),
      lieu: operation.lieu || "NON SPÉCIFIÉ",
      categorie: operation.Categorie?.nom_categorie || "Autre",
      type: operation.type_operation,
      moyen_paiement: operation.moyen_paiement
    }));

    res.json({
      success: true,
      operations: formattedOperations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des opérations',
      error: error.message
    });
  }
}

// --------------------------------------------------------------------

// Implementation for frontend API call: getOperations(filters)
export async function getOperations(req, res) {
  try {
    const { month, budget, category } = req.query;
    const userId = req.user.id;

    // Find user's account
    const compte = await Compte.findOne({
      where: { utilisateurId: userId }
    });

    if (!compte) {
      return res.status(404).json({
        success: false,
        message: 'Compte non trouvé pour l\'utilisateur'
      });
    }

    // Build query conditions
    const whereConditions = {
      compteId: compte.id
    };

    // Handle month filter (YYYY-MM format)
    if (month && validator.matches(month, /^\d{4}-\d{2}$/)) {
      const [year, monthNum] = month.split('-').map(Number);

      // Create date range for the month
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0); // Last day of month

      whereConditions.date_operation = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Handle budget filter
    if (budget && validator.isInt(budget.toString())) {
      whereConditions.budgetId = budget;
    }

    // Include conditions
    const includeConditions = [{
      model: Categorie,
      attributes: ['id', 'nom_categorie']
    }];

    // Handle category filter
    if (category) {
      includeConditions[0].where = { nom_categorie: category };
    }

    // Get operations
    const operations = await Operation.findAll({
      where: whereConditions,
      include: includeConditions,
      order: [['date_operation', 'DESC']]
    });

    // Format the response
    const formattedOperations = operations.map(operation => ({
      id: operation.id.toString(),
      libelle: operation.nom_operation,
      price: parseFloat(operation.montant_operation),
      date: formatDate(operation.date_operation),
      lieu: operation.lieu || "NON SPÉCIFIÉ",
      categorie: operation.Categorie?.nom_categorie || "Autre",
      type: operation.type_operation,
      moyen_paiement: operation.moyen_paiement
    }));

    res.status(200).json({
      success: true,
      operations: formattedOperations
    });
  } catch (error) {
    console.error('Error fetching operations:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des opérations",
      error: error.message
    });
  }
}

// --------------------------------------------------------------------

// Implementation for frontend API call: searchOperations(searchQuery, budgetId)
export async function searchOperations(req, res) {
  try {
    const { search, budget_id } = req.query;
    const userId = req.user.id;

    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Le paramètre de recherche est requis"
      });
    }

    // Find user's account
    const compte = await Compte.findOne({
      where: { utilisateurId: userId }
    });

    if (!compte) {
      return res.status(404).json({
        success: false,
        message: 'Compte non trouvé pour l\'utilisateur'
      });
    }

    // Build query conditions
    const whereConditions = {
      compteId: compte.id,
      [Op.or]: [
        { nom_operation: { [Op.like]: `%${search}%` } },
        { lieu: { [Op.like]: `%${search}%` } }
      ]
    };

    // Add budget filter if provided
    if (budget_id && validator.isInt(budget_id.toString())) {
      whereConditions.budgetId = budget_id;
    }

    // Get operations
    const operations = await Operation.findAll({
      where: whereConditions,
      include: [{
        model: Categorie,
        attributes: ['id', 'nom_categorie']
      }],
      order: [['date_operation', 'DESC']]
    });

    // Format the response
    const formattedOperations = operations.map(operation => ({
      id: operation.id.toString(),
      libelle: operation.nom_operation,
      price: parseFloat(operation.montant_operation),
      date: formatDate(operation.date_operation),
      lieu: operation.lieu || "NON SPÉCIFIÉ",
      categorie: operation.Categorie?.nom_categorie || "Autre",
      type: operation.type_operation,
      moyen_paiement: operation.moyen_paiement
    }));

    res.status(200).json({
      success: true,
      operations: formattedOperations
    });
  } catch (error) {
    console.error('Error searching operations:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche d'opérations",
      error: error.message
    });
  }
}

/**
 * Helper function to format date to DD/MM/YYYY
 */
function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}
