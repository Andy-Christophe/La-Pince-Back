import { Model, DataTypes } from 'sequelize';

// Model est la classe de base de Sequelize pour définir des models (la structure des tables)
// DataTypes contient les types de données pour les colonnes des models

import sequelize from '../database.js';

class Alerte extends Model {}
// Declare le model alerte qui hérite de model (sequelize)

Alerte.init({

  // initialise le model alerte pour lui ajouter données et contraintes
  type_alerte: { 
    type: DataTypes.STRING(30), 
    allowNull: false 
  },
  message: { 
    type: DataTypes.STRING(500), 
    allowNull: false 
  },
  date_lecture: { 
    type: DataTypes.DATE 
  },
  niveau_urgence: { 
    type: DataTypes.STRING(20), 
    defaultValue: 'info' 
  },
  budgetId: { // Clé étrangère obligatoire vers Budget
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Alerte',
  tableName: 'alerte',
  timestamps: true, // Ajoute createdAt et updatedAt
});

export default Alerte;