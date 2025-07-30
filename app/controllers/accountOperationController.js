import {
  Operation,
  Compte,
  Categorie,
  Budget,
} from "../models/associations.js";
import validator from "validator";
import { cloudinary } from "../../index.js";
import { Op } from "sequelize";

// Fonction pour lier automatiquement une opération à un budget
async function linkOperationToBudget(operation) {
  try {
    const operationDate = new Date(operation.date_operation);
    const month = operationDate.getMonth() + 1;
    const year = operationDate.getFullYear();

    // Chercher un budget correspondant (même catégorie, mois, année et compte)
    const matchingBudget = await Budget.findOne({
      where: {
        categorieId: operation.categorieId,
        compteId: operation.compteId,
        mois: month,
        annee: year,
      },
    });

    if (matchingBudget) {
      // Lier l'opération au budget
      await operation.update({ budgetId: matchingBudget.id });
      console.log(
        `✅ Opération ${operation.id} liée au budget ${matchingBudget.nom_budget}`
      );
    }
  } catch (error) {
    console.error("❌ Erreur lors de la liaison budget-opération:", error);
  }
}

// --------------------------------------------------------------------

export async function createOperationAccount(req, res) {
  try {
    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id },
    });
    if (!compte) {
      return res
        .status(404)
        .json({ error: "Compte non trouvé pour l'utilisateur." });
    }

    const {
      montant_operation,
      nom_operation,
      moyen_paiement,
      lieu,
      categorieId,
      date_operation,
      type_operation,
    } = req.body;

    if (
      !montant_operation ||
      (!validator.isDecimal(montant_operation.toString()) &&
        montant_operation === 0)
    ) {
      return res.status(400).json({
        error: "Le montant de l'opération doit être un nombre décimal.",
      });
    }
    if (
      nom_operation === null &&
      !validator.isLength(nom_operation, { min: 1, max: 150 })
    ) {
      return res.status(400).json({
        error: "Le nom de l'opération doit faire 1 à 150 caractères.",
      });
    }
    const moyenPaiementFinal =
      moyen_paiement === undefined ||
      moyen_paiement === null ||
      moyen_paiement === ""
        ? "carte"
        : moyen_paiement;

    if (!validator.isLength(moyenPaiementFinal, { min: 1, max: 30 })) {
      return res
        .status(400)
        .json({ error: "Le moyen de paiement doit faire 1 à 30 caractères." });
    }
    if (
      lieu !== null &&
      lieu !== undefined &&
      lieu !== "" &&
      !validator.isLength(lieu, { min: 1, max: 100 })
    ) {
      return res
        .status(400)
        .json({ error: "Le lieu doit faire entre 1 et 100 caractères." });
    }

    const categorie = await Categorie.findByPk(categorieId);
    if (!categorie) {
      return res.status(404).json({ error: "Catégorie non trouvée." });
    }

    if (!validator.isDate(date_operation)) {
      return res
        .status(400)
        .json({ error: "La date de l'opération doit être une date valide." });
    }

    if (type_operation != "revenu" && type_operation != "depense") {
      return res.status(400).json({ error: "L'opération n'est pas valide" });
    }

    if (type_operation) {
      compte.solde_courant =
        parseFloat(compte.solde_courant) + parseFloat(montant_operation);
    }
    await compte.save();

    const operation = await Operation.create({
      montant_operation,
      nom_operation,
      moyen_paiement: moyenPaiementFinal,
      lieu,
      date_operation,
      type_operation,
      compteId: compte.id,
      categorieId,
    });

    // 🎯 LIAISON AUTOMATIQUE AU BUDGET
    await linkOperationToBudget(operation);

    res.status(201).json(operation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------------------------------------------------------

export async function getOperationByIdAccount(req, res) {
  try {
    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id },
    });

    if (!compte) {
      return res
        .status(404)
        .json({ error: "Compte non trouvé pour l'utilisateur." });
    }

    const operations = await Operation.findAll({
      where: {
        compteId: compte.id,
      },
    });

    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------------------------------------------------------

export async function getAllOperationsAccount(req, res) {
  try {
    const operations = await Operation.findAll();
    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------------------------------------------------------

export async function updateOperationAccount(req, res) {
  try {
    const { id } = req.params;

    // Vérifier le compte de l'utilisateur
    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id },
    });

    if (!compte) {
      return res
        .status(404)
        .json({ error: "Compte non trouvé pour l'utilisateur." });
    }

    // Trouver l'opération ET vérifier qu'elle appartient au compte
    const operation = await Operation.findOne({
      where: {
        id: id,
        compteId: compte.id, // Vérification de propriétaire
      },
    });

    if (!operation) {
      return res
        .status(404)
        .json({ error: "Opération non trouvée ou non autorisée." });
    }

    const {
      montant_operation,
      nom_operation,
      moyen_paiement,
      lieu,
      categorieId,
      date_operation,
      type_operation,
    } = req.body;

    if (montant_operation !== undefined) {
      if (
        !montant_operation ||
        !validator.isDecimal(montant_operation.toString())
      ) {
        return res.status(400).json({
          error: "Le montant de l'opération doit être un nombre décimal.",
        });
      }
    }

    if (nom_operation !== undefined) {
      if (
        !nom_operation ||
        !validator.isLength(nom_operation, { min: 1, max: 150 })
      ) {
        return res.status(400).json({
          error: "Le nom de l'opération doit faire 1 à 150 caractères.",
        });
      }
    }

    const moyenPaiementFinal =
      moyen_paiement === undefined ||
      moyen_paiement === null ||
      moyen_paiement === ""
        ? "carte"
        : moyen_paiement;

    // Valider la longueur
    if (!validator.isLength(moyenPaiementFinal, { min: 1, max: 30 })) {
      return res
        .status(400)
        .json({ error: "Le moyen de paiement doit faire 1 à 30 caractères." });
    }

    if (
      lieu !== null &&
      lieu !== undefined &&
      lieu !== "" &&
      !validator.isLength(lieu, { min: 1, max: 100 })
    ) {
      return res
        .status(400)
        .json({ error: "Le lieu doit faire entre 1 et 100 caractères." });
    }

    if (categorieId !== undefined) {
      if (!categorieId) {
        return res.status(400).json({ error: "La catégorie est requise." });
      }

      const categorie = await Categorie.findByPk(categorieId);
      if (!categorie) {
        return res.status(404).json({ error: "Catégorie non trouvée." });
      }
    }

    if (date_operation !== undefined) {
      if (!validator.isDate(date_operation)) {
        return res
          .status(400)
          .json({ error: "La date de l'opération doit être une date valide." });
      }
    }

    if (type_operation !== undefined) {
      if (type_operation != "revenu" && type_operation != "depense") {
        return res.status(400).json({ error: "L'opération n'est pas valide" });
      }
    }

    // Préparer les données de mise à jour
    const updateData = {};

    if (montant_operation !== undefined) {
      updateData.montant_operation = montant_operation;
    }
    if (nom_operation !== undefined) {
      updateData.nom_operation = nom_operation;
    }
    if (moyen_paiement !== undefined) {
      updateData.moyen_paiement = moyenPaiementFinal;
    }
    if (lieu !== undefined) {
      updateData.lieu = lieu;
    }
    if (date_operation !== undefined) {
      updateData.date_operation = date_operation;
    }
    if (type_operation !== undefined) {
      updateData.type_operation = type_operation;
    }
    if (categorieId !== undefined) {
      updateData.categorieId = categorieId;
    }

    // --- MAJ DU SOLDE COURANT ---
    // On récupère l'ancien montant et le nouveau (ou l'ancien si non modifié)
    const oldMontant = parseFloat(operation.montant_operation);
    const newMontant =
      montant_operation !== undefined
        ? parseFloat(montant_operation)
        : oldMontant;

    // Met à jour le solde_courant (retire l'ancien montant, ajoute le nouveau)
    compte.solde_courant =
      parseFloat(compte.solde_courant) - oldMontant + newMontant;
    await compte.save();

    await operation.update(updateData);

    // 🎯 RE-LIER AU BUDGET si catégorie ou date changée
    if (categorieId !== undefined || date_operation !== undefined) {
      await linkOperationToBudget(operation);
    }

    res.status(200).json({
      success: true,
      message: "Opération modifiée avec succès",
      operation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// --------------------------------------------------------------------

export async function deleteOperationAccount(req, res) {
  try {
    const { id } = req.params;

    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id },
    });

    if (!compte) {
      return res
        .status(404)
        .json({ error: "Compte non trouvé pour l'utilisateur." });
    }

    const operation = await Operation.findOne({
      where: {
        id: id,
        compteId: compte.id,
      },
    });

    if (!operation) {
      return res
        .status(404)
        .json({ error: "Opération non trouvée ou non autorisée." });
    }

    // Met à jour le solde_courant en annulant l'effet de l'opération supprimée
    compte.solde_courant =
      parseFloat(compte.solde_courant) -
      parseFloat(operation.montant_operation);

    await compte.save();
    await operation.destroy();

    res.json({ message: "Opération supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
// ----------------------------------------------------------------

export async function getOperationByDateAccount(req, res) {
  try {
    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id },
    });

    if (!compte) {
      return res
        .status(404)
        .json({ error: "Compte non trouvé pour l'utilisateur." });
    }

    const { date_operation } = req.query;
    console.log(date_operation);

    if (!date_operation) {
      return res.status(400).json({ error: "La date est requise." });
    }

    if (!validator.isDate(date_operation)) {
      return res.status(400).json({ error: "Format de date invalide" });
    }

    const operations = await Operation.findAll({
      where: {
        compteId: compte.id,
        date_operation: date_operation,
      },
      include: [
        {
          model: Categorie,
          attributes: ["nom_categorie", "icone"],
        },
      ],
      order: [["date_operation", "DESC"]],
    });

    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ----------------------------------------------------------------

export async function getOperationByMonthAccount(req, res) {
  try {
    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id },
    });

    if (!compte) {
      return res
        .status(404)
        .json({ error: "Compte non trouvé pour l'utilisateur." });
    }

    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Le mois et l'année sont requis." });
    }

    if (
      !validator.isInt(month, { min: 1, max: 12 }) ||
      !validator.isInt(year)
    ) {
      return res.status(400).json({ error: "Mois ou année invalide." });
    }

    const operations = await Operation.findAll({
      where: {
        compteId: compte.id,
        date_operation: {
          [Op.gte]: new Date(year, month - 1, 1),
          [Op.lt]: new Date(year, month, 1),
        },
      },
      include: [
        {
          model: Categorie,
          attributes: ["nom_categorie", "icone"],
        },
      ],
      order: [["date_operation", "DESC"]],
    });

    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ----------------------------------------------------------------
// NOUVELLE FONCTION : Lier toutes les opérations d'un mois aux budgets
export async function linkOperationsTobudgets(req, res) {
  try {
    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id },
    });

    if (!compte) {
      return res
        .status(404)
        .json({ error: "Compte non trouvé pour l'utilisateur." });
    }

    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Le mois et l'année sont requis." });
    }

    // Récupérer toutes les opérations du mois sans budget
    const operations = await Operation.findAll({
      where: {
        compteId: compte.id,
        budgetId: null, // Seulement les opérations non liées
        date_operation: {
          [Op.gte]: new Date(year, month - 1, 1),
          [Op.lt]: new Date(year, month, 1),
        },
      },
    });

    let linkedCount = 0;

    // Lier chaque opération à son budget
    for (const operation of operations) {
      await linkOperationToBudget(operation);
      linkedCount++;
    }

    res.json({
      success: true,
      message: `${linkedCount} opérations traitées pour la liaison aux budgets`,
      linkedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
