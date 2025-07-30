import validator from "validator";
import { Budget, Compte, Categorie, Alerte } from "../models/associations.js";

// --------------------------------------------------------------------
// CREATE BUDGET
export async function createBudget(req, res) {
  try {
    console.log("🔍 Request body received:", JSON.stringify(req.body, null, 2));
    console.log("🔍 User from JWT:", req.user);

    const {
      nom_budget,
      montant_limite,
      categorieId,
      compteId,
      seuil_alerte,
      type_budget,
      mois,
      annee,
    } = req.body;

    console.log("🔍 Extracted values:", {
      nom_budget,
      montant_limite,
      categorieId,
      compteId,
      seuil_alerte,
      type_budget,
      mois,
      annee,
    });

    // Validation des champs
    if (!nom_budget || !validator.isLength(nom_budget, { min: 1, max: 100 })) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: { nom: "Le nom du budget doit faire 1 à 100 caractères." },
      });
    }

    if (!montant_limite || !validator.isDecimal(montant_limite.toString())) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: { montant: "Le montant limite doit être un nombre décimal." },
      });
    }

    if (!compteId || !validator.isInt(compteId.toString(), { min: 1 })) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: {
          compteId: "Le compte est requis et doit être un entier positif.",
        },
      });
    }

    if (!categorieId || !validator.isInt(categorieId.toString(), { min: 1 })) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: {
          categorieId:
            "La catégorie est requise et doit être un entier positif.",
        },
      });
    }

    if (
      seuil_alerte &&
      !validator.isInt(seuil_alerte.toString(), { min: 1, max: 100 })
    ) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: { seuil_alerte: "Le seuil d'alerte doit être entre 1 et 100." },
      });
    }

    if (type_budget && !validator.isLength(type_budget, { min: 1, max: 50 })) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: {
          type_budget: "Le type de budget doit faire 1 à 50 caractères.",
        },
      });
    }

    // Vérifier que le compte appartient à l'utilisateur
    const compte = await Compte.findOne({
      where: {
        id: compteId,
        utilisateurId: req.user.id,
      },
    });

    if (!compte) {
      return res.status(404).json({
        success: false,
        message: "Compte non trouvé pour cet utilisateur",
      });
    }

    // Vérifier que la catégorie existe
    const categorie = await Categorie.findByPk(categorieId);
    if (!categorie) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: { categorieId: "Catégorie non trouvée." },
      });
    }

    // Créer le budget
    console.log("🔍 About to create budget with:", {
      nom_budget,
      montant_limite,
      categorieId,
      compteId,
      seuil_alerte: seuil_alerte || 80,
      mois: mois || new Date().getMonth() + 1,
      annee: annee || new Date().getFullYear(),
      type_budget: type_budget || "standard",
    });

    const budget = await Budget.create({
      nom_budget,
      montant_limite,
      categorieId,
      compteId,
      seuil_alerte: seuil_alerte || 80,
      mois: mois || new Date().getMonth() + 1,
      annee: annee || new Date().getFullYear(),
      type_budget: type_budget || "standard",
    });

    // ✅ ENHANCED RESPONSE - Return complete data
    res.status(201).json({
      success: true,
      message: "Budget créé avec succès",
      budget: {
        id: budget.id.toString(),
        nom: budget.nom_budget,
        categorie: categorie.nom_categorie,
        montant: parseFloat(budget.montant_limite),
        seuil_alerte: parseFloat(budget.seuil_alerte),
        type_budget: budget.type_budget,
        mois: budget.mois,
        annee: budget.annee,
        compteId: budget.compteId,
        categorieId: budget.categorieId,
      },
    });
  } catch (error) {
    // Enhanced error logging
    console.error("❌ Budget creation error:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);

    if (error.name === "SequelizeValidationError") {
      console.error("❌ Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        message: "Erreurs de validation",
        errors: error.errors.reduce((acc, err) => {
          acc[err.path] = err.message;
          return acc;
        }, {}),
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      console.error("❌ Unique constraint error:", error.errors);
      return res.status(400).json({
        success: false,
        message: "Données en conflit",
        errors: { global: "Un budget similaire existe déjà." },
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      console.error("❌ Foreign key error:", error.fields);
      return res.status(400).json({
        success: false,
        message: "Référence invalide",
        errors: { global: `Référence invalide: ${error.fields}` },
      });
    }

    res.status(400).json({
      success: false,
      message: "Données invalides",
      errors: {
        global: error.message,
        type: error.name,
      },
    });
  }
}

// --------------------------------------------------------------------
// GET USER BUDGETS
export async function getUserBudgets(req, res) {
  try {
    const userId = req.user.id;

    const budgets = await Budget.findAll({
      include: [
        {
          model: Compte,
          where: { utilisateurId: userId },
          attributes: ["id", "nom_compte"],
        },
        {
          model: Categorie,
          attributes: ["id", "nom_categorie"],
        },
      ],
    });

    const budgetsObject = {};
    budgets.forEach((budget) => {
      budgetsObject[budget.id] = {
        id: budget.id.toString(),
        nom: budget.nom_budget,
        categorie: budget.Categorie?.nom_categorie || "Autre",
        categorieId: budget.categorieId,
        montant: parseFloat(budget.montant_limite),
        seuil_alerte: parseFloat(budget.seuil_alerte),
        mois: budget.mois || new Date().getMonth() + 1,
        annee: budget.annee || new Date().getFullYear(),
        type_budget: budget.type_budget || "standard",
      };
    });

    res.status(200).json({
      success: true,
      budgets: budgetsObject,
    });
  } catch (error) {
    console.error("Error fetching user budgets:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des budgets",
      error: error.message,
    });
  }
}

// --------------------------------------------------------------------
// GET ALL BUDGETS
export async function getAllBudgets(req, res) {
  try {
    const userId = req.user.id;

    const budgets = await Budget.findAll({
      include: [
        {
          model: Compte,
          where: { utilisateurId: userId },
          attributes: ["id", "nom_compte"],
        },
        {
          model: Categorie,
          attributes: ["id", "nom_categorie"],
        },
      ],
    });

    res.json({
      success: true,
      budgets: budgets.map((budget) => ({
        id: budget.id.toString(),
        nom: budget.nom_budget,
        categorie: budget.Categorie?.nom_categorie || "Autre",
        montant: parseFloat(budget.montant_limite),
        seuil_alerte: parseFloat(budget.seuil_alerte),
        mois: budget.mois || new Date().getMonth() + 1,
        annee: budget.annee || new Date().getFullYear(),
        type_budget: budget.type_budget || "standard",
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des budgets",
      error: error.message,
    });
  }
}

// --------------------------------------------------------------------
// GET BUDGET BY ID
export async function getBudgetById(req, res) {
  try {
    const budget = await Budget.findByPk(req.params.id, {
      include: [
        {
          model: Categorie,
          attributes: ["id", "nom_categorie"],
        },
        {
          model: Compte,
          attributes: ["utilisateurId"],
        },
      ],
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget non trouvé",
      });
    }

    if (budget.Compte.utilisateurId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé à ce budget",
      });
    }

    res.json({
      success: true,
      budget: {
        id: budget.id.toString(),
        nom: budget.nom_budget,
        categorie: budget.Categorie?.nom_categorie || "Autre",
        montant: parseFloat(budget.montant_limite),
        seuil_alerte: parseFloat(budget.seuil_alerte),
        mois: budget.mois || new Date().getMonth() + 1,
        annee: budget.annee || new Date().getFullYear(),
        type_budget: budget.type_budget || "standard",
        compteId: budget.compteId,
        categorieId: budget.categorieId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du budget",
      error: error.message,
    });
  }
}

// --------------------------------------------------------------------
// UPDATE BUDGET
export async function updateBudget(req, res) {
  try {
    const { id } = req.params;
    const { montant_limite, seuil_alerte, nom_budget, compteId, categorieId, type_budget, mois, annee, seuil_pourcentage } = req.body;

    // Find budget with security check
    const budget = await Budget.findByPk(id, {
      include: [
        {
          model: Compte,
          attributes: ["utilisateurId"],
        },
        {
          model: Categorie,
          attributes: ["nom_categorie"],
        },
      ],
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget non trouvé",
      });
    }

    // Security check
    if (budget.Compte.utilisateurId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé à ce budget",
      });
    }

    // Validation des champs
    if (
      montant_limite !== undefined &&
      !validator.isFloat(montant_limite.toString(), { min: 0 })
    ) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: { montant: "Le montant limite doit être un nombre positif." },
      });
    }

    if (
      seuil_alerte !== undefined &&
      !validator.isFloat(seuil_alerte.toString(), { min: 0, max: 100 })
    ) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: {
          seuil_alerte: "Le seuil d'alerte doit être un nombre entre 0 et 100.",
        },
      });
    }

    if (
      nom_budget !== undefined &&
      !validator.isLength(nom_budget, { min: 1, max: 100 })
    ) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: {
          nom_budget: "Le nom du budget doit faire 1 à 100 caractères.",
        },
      });
    }

    if (
      compteId !== undefined &&
      !validator.isInt(compteId.toString(), { min: 1 })
    ) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: { compteId: "Le compte associé doit être un entier positif." },
      });
    }

    if (
      categorieId !== undefined &&
      !validator.isInt(categorieId.toString(), { min: 1 })
    ) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: {
          categorieId: "La catégorie associée doit être un entier positif.",
        },
      });
    }

    if (
      type_budget !== undefined &&
      !validator.isLength(type_budget, { min: 1, max: 50 })
    ) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: {
          type_budget: "Le type de budget doit faire 1 à 50 caractères.",
        },
      });
    }

    // Update budget
    await budget.update({
      montant_limite,
      seuil_alerte,
      nom_budget,
      compteId,
      categorieId,
      type_budget,
      mois,
      annee,
      seuil_pourcentage
    });

    // ✅ ENHANCED RESPONSE - Return updated data
    const updatedBudget = await Budget.findByPk(id, {
      include: [
        {
          model: Categorie,
          attributes: ["nom_categorie"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Budget modifié avec succès",
      budget: {
        id: updatedBudget.id.toString(),
        nom: updatedBudget.nom_budget,
        categorie: updatedBudget.Categorie?.nom_categorie || "Autre",
        montant: parseFloat(updatedBudget.montant_limite),
        seuil_alerte: parseFloat(updatedBudget.seuil_alerte),
        type_budget: updatedBudget.type_budget,
        mois: updatedBudget.mois,
        annee: updatedBudget.annee,
        compteId: updatedBudget.compteId,
        categorieId: updatedBudget.categorieId,
        seuil_pourcentage: updatedBudget.seuil_pourcentage
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Données invalides",
      errors: { global: error.message },
    });
  }
}

// --------------------------------------------------------------------
// DELETE BUDGET
export async function deleteBudget(req, res) {
  try {
    const { id } = req.params;

    // Find budget with security check
    const budget = await Budget.findByPk(id, {
      include: [
        {
          model: Compte,
          attributes: ["utilisateurId"],
        },
      ],
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget non trouvé",
      });
    }

    // Security check
    if (budget.Compte.utilisateurId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé à ce budget",
      });
    }

    await budget.destroy();

    res.json({
      success: true,
      message: "Budget supprimé avec succès",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
}
