import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

class Operation extends Model {}

Operation.init(
  {
    montant_operation: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    nom_operation: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    // Clé étrangère vers Compte
    compteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Clé étrangère vers Categorie
    categorieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Clé étrangère vers Budget (optionnel)
    budgetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    moyen_paiement: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: "carte",
    },
    lieu: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    date_operation: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    type_operation: {
      type: DataTypes.ENUM("revenu", "depense"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Operation",
    tableName: "operation",
    timestamps: true,
  }
);


export default Operation;

