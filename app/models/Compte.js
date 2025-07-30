import { Model, DataTypes } from 'sequelize';
import sequelize from '../database.js';

class Compte extends Model { }

Compte.init({
  nom_compte: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  banque: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  solde_initial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  devise: {
    type: DataTypes.STRING(5),
    allowNull: false,
    defaultValue: 'EUR'
  },
  solde_courant: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },

  // Clé étrangère vers utilisateur (sera créée par l'association)
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: false
    // L'association dans associations.js gère la FK
  }
}, {
  sequelize,
  modelName: 'Compte',
  tableName: 'compte',
  timestamps: true
});

export default Compte;