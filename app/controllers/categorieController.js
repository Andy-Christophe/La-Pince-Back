import { Categorie } from '../models/associations.js';

// Créer une catégorie
export async function createCategorie(req, res) {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    const { nom_categorie, description, couleur, icone } = req.body;
    const categorie = await Categorie.create({ nom_categorie, description, couleur, icone });
    res.status(201).json(categorie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


// --------------------------------------------------------------------


// Récupérer toutes les catégories
export async function getAllCategories(req, res) {
  try {
    const categories = await Categorie.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// --------------------------------------------------------------------


// Récupérer une catégorie par son id
export async function getCategorieById(req, res) {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// --------------------------------------------------------------------


// Mettre à jour une catégorie
export async function updateCategorie(req, res) {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    const { id } = req.params;
    const { nom_categorie, description, couleur, icone } = req.body;
    const categorie = await Categorie.findByPk(id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });
    await categorie.update({ nom_categorie, description, couleur, icone });
    res.json(categorie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


// --------------------------------------------------------------------


// Supprimer une catégorie
export async function deleteCategorie(req, res) {
  try {
    const { id } = req.params;
    const categorie = await Categorie.findByPk(id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });
    await categorie.destroy();
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}