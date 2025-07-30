// relation entre les différentes tables pour éviter un bugg

import Utilisateur from "./Utilisateur.js";
import Compte from "./Compte.js";
import Categorie from "./Categorie.js";
import Operation from "./Operation.js";
import Budget from "./Budget.js";
import Alerte from "./Alerte.js";

// Déclare la relation : un Compte appartient à un Utilisateur (clé étrangère utilisateurId)
Compte.belongsTo(Utilisateur, { foreignKey: "utilisateurId" });
// un utilisateur a un compte (peut evoluer en hasmany pour les évolutions potentielles)
Utilisateur.hasOne(Compte, { foreignKey: "utilisateurId" });

// Un Operation appartient à un Compte (clé étrangère compteId)
Operation.belongsTo(Compte, { foreignKey: "compteId" });
// Un Compte possède plusieurs Operations
Compte.hasMany(Operation, { foreignKey: "compteId" });

// Une Operation appartient à une Categorie (clé étrangère categorieId)
Operation.belongsTo(Categorie, { foreignKey: "categorieId" });
// Une Categorie possède plusieurs Operations
Categorie.hasMany(Operation, { foreignKey: 'categorieId' });

// Un Budget appartient à un Compte (clé étrangère compteId)
Budget.belongsTo(Compte, { foreignKey: "compteId" });
// Un Compte possède plusieurs Budgets
Compte.hasMany(Budget, { foreignKey: "compteId" });

// Un Budget appartient à une Categorie (clé étrangère categorieId)
Budget.belongsTo(Categorie, { foreignKey: "categorieId" });
// Une Categorie possède plusieurs Budgets
Categorie.hasMany(Budget, { foreignKey: "categorieId" });

// Une Operation appartient à un Budget (clé étrangère budgetId, optionnel)
Operation.belongsTo(Budget, { foreignKey: "budgetId" });
// Un Budget possède plusieurs Operations
Budget.hasMany(Operation, { foreignKey: "budgetId" });

// Une Alerte appartient à un Budget (clé étrangère budgetId)
Alerte.belongsTo(Budget, { foreignKey: "budgetId" });
// Un Budget possède plusieurs Alertes
Budget.hasMany(Alerte, { foreignKey: "budgetId" });

export { Utilisateur, Compte, Categorie, Operation, Budget, Alerte };
