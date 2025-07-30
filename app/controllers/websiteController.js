import validator from 'validator';
import Categorie from '../models/Categorie.js';
import Operation from '../models/Operation.js'; 
import Budget from '../models/Budget.js';  

const websiteController = {

  overview: async (req, res) => {
    try {
      const totalOperation = await Operation.sum('montant');
      const totalBudget = await Budget.sum('total');
      const remaining = totalBudget - totalOperation;
      res.json({
        message: 'Overview endpoint',
        data: {
          totalOperation,
          totalBudget,
          remaining
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Database error', details: error.message });
    }
  },

  stats: async (req, res) => {
    try {
      const stats = await Operation.findAll({
        attributes: [
          'categorie',
          [Operation.sequelize.fn('SUM', Operation.sequelize.col('montant')), 'total']
        ],
        group: ['categorie']
      });
      res.json({
        message: 'Operations stats endpoint',
        stats
      });
    } catch (error) {
      res.status(500).json({ error: 'Database error', details: error.message });
    }
  },

  categories: async (req, res) => {
    try {
      const categories = await Categorie.findAll({ attributes: ['nom_categorie'] });
      res.json({
        message: 'Categories endpoint',
        categories: categories.map(cat => cat.nom_categorie)
      });
    } catch (error) {
      res.status(500).json({ error: 'Database error', details: error.message });
    }
  }

};

export default websiteController;