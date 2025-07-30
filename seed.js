import 'dotenv/config';
import sequelize from './app/database.js';
import './app/models/associations.js';
import Categorie from './app/models/Categorie.js';
import Alerte from './app/models/Alerte.js';

const ALERTES_TEMPLATES = [
  {
    type_alerte: 'budget_warning_50',
    message: 'Information : Vous avez atteint 50% de votre budget {budget_name} ({current_amount}€/{max_amount}€)',
    niveau_urgence: 'info',

  },
  {
    type_alerte: 'budget_warning_80',
    message: 'Attention ! Vous avez dépassé 80% de votre budget {budget_name} ({current_amount}€/{max_amount}€)',
    niveau_urgence: 'warning',

  },
  {
    type_alerte: 'budget_critical_100',
    message: 'URGENT ! Votre budget {budget_name} est dépassé ! {current_amount}€/{max_amount}€',
    niveau_urgence: 'critical',

  }
];
const CATEGORIES_SYSTEME = [

  {
    nom_categorie: 'Revenus',
    description: 'Salaire, primes, revenus',
    couleur: '#98D8C8',
    icone: '💰'
  },
  // Nouvelles catégories de revenus
  {
    nom_categorie: 'Revenus locatifs',
    description: 'Loyers perçus, revenus immobiliers',
    couleur: '#85C1E9',
    icone: '🏘️'
  },
  {
    nom_categorie: 'Ventes & Commissions',
    description: 'Ventes produits, commissions, freelance',
    couleur: '#82E0AA',
    icone: '💼'
  },
  {
    nom_categorie: 'Dividendes & Intérêts',
    description: 'Dividendes actions, intérêts placements',
    couleur: '#F8C471',
    icone: '📈'
  },
  {
    nom_categorie: 'Revenus secondaires',
    description: 'Petits boulots, ventes occasionnelles',
    couleur: '#BB8FCE',
    icone: '💡'
  },
  {
    nom_categorie: 'Allocations & Aides',
    description: 'CAF, Pôle emploi, aides sociales',
    couleur: '#AED6F1',
    icone: '🤝'
  },
  {
    nom_categorie: 'Épargne',
    description: 'Livret A, investissements',
    couleur: '#F7DC6F',
    icone: '🏦'
  },


  // 🍽️ ALIMENTATION & BOISSONS
  {
    nom_categorie: 'Courses alimentaires',
    description: 'Supermarché, épicerie, marché',
    couleur: '#FF6B6B',
    icone: '🛒'
  },
  {
    nom_categorie: 'Restaurants',
    description: 'Restaurants, fast-food, livraisons',
    couleur: '#FF8E53',
    icone: '🍽️'
  },
  {
    nom_categorie: 'Cafés & Bars',
    description: 'Café, bar, boissons',
    couleur: '#A0522D',
    icone: '☕'
  },

  // 🚗 TRANSPORT
  {
    nom_categorie: 'Essence',
    description: 'Carburant, diesel, électrique',
    couleur: '#4ECDC4',
    icone: '⛽'
  },
  {
    nom_categorie: 'Transport public',
    description: 'Bus, métro, train, tramway',
    couleur: '#45B7D1',
    icone: '🚌'
  },
  {
    nom_categorie: 'Entretien véhicule',
    description: 'Réparations, révisions, pneus',
    couleur: '#96CEB4',
    icone: '🔧'
  },
  {
    nom_categorie: 'Parking & Péages',
    description: 'Stationnement, autoroutes',
    couleur: '#FFEAA7',
    icone: '🅿️'
  },
  {
    nom_categorie: 'Assurance véhicule',
    description: 'Assurance auto, moto',
    couleur: '#DDA0DD',
    icone: '🛡️'
  },

  // 🏠 LOGEMENT
  {
    nom_categorie: 'Loyer',
    description: 'Loyer mensuel, charges locatives',
    couleur: '#74B9FF',
    icone: '🏠'
  },
  {
    nom_categorie: 'Électricité',
    description: 'Facture électricité',
    couleur: '#FDCB6E',
    icone: '⚡'
  },
  {
    nom_categorie: 'Eau',
    description: 'Facture eau',
    couleur: '#00B894',
    icone: '💧'
  },
  {
    nom_categorie: 'Gaz',
    description: 'Facture gaz',
    couleur: '#E17055',
    icone: '🔥'
  },
  {
    nom_categorie: 'Internet & Téléphone',
    description: 'Box internet, forfait mobile',
    couleur: '#A29BFE',
    icone: '📡'
  },
  {
    nom_categorie: 'Mobilier & Déco',
    description: 'Meubles, décoration, électroménager',
    couleur: '#FD79A8',
    icone: '🛋️'
  },

  // 💊 SANTÉ
  {
    nom_categorie: 'Médecin',
    description: 'Consultations, spécialistes',
    couleur: '#00CED1',
    icone: '👨‍⚕️'
  },
  {
    nom_categorie: 'Pharmacie',
    description: 'Médicaments, produits de santé',
    couleur: '#32CD32',
    icone: '💊'
  },
  {
    nom_categorie: 'Dentiste',
    description: 'Soins dentaires',
    couleur: '#87CEEB',
    icone: '🦷'
  },
  {
    nom_categorie: 'Mutuelle',
    description: 'Assurance santé',
    couleur: '#98FB98',
    icone: '🏥'
  },

  // 🎮 LOISIRS & CULTURE
  {
    nom_categorie: 'Cinéma & Spectacles',
    description: 'Cinéma, théâtre, concerts',
    couleur: '#FF69B4',
    icone: '🎬'
  },
  {
    nom_categorie: 'Sport',
    description: 'Salle de sport, équipements sportifs',
    couleur: '#32CD32',
    icone: '⚽'
  },
  {
    nom_categorie: 'Livres & Magazines',
    description: 'Lectures, presse',
    couleur: '#DAA520',
    icone: '📚'
  },
  {
    nom_categorie: 'Streaming & Gaming',
    description: 'Netflix, Spotify, jeux vidéo',
    couleur: '#8A2BE2',
    icone: '🎮'
  },
  {
    nom_categorie: 'Voyages',
    description: 'Vacances, weekend, hôtels',
    couleur: '#FF6347',
    icone: '✈️'
  },

  // 👔 PROFESSIONNEL & ÉDUCATION
  {
    nom_categorie: 'Formation',
    description: 'Cours, formations, éducation',
    couleur: '#4682B4',
    icone: '🎓'
  },
  {
    nom_categorie: 'Matériel professionnel',
    description: 'Ordinateur, fournitures bureau',
    couleur: '#708090',
    icone: '💻'
  },

  // 👕 SHOPPING
  {
    nom_categorie: 'Vêtements',
    description: 'Habits, chaussures, accessoires',
    couleur: '#FF1493',
    icone: '👕'
  },
  {
    nom_categorie: 'Beauté & Hygiène',
    description: 'Cosmétiques, produits hygiène',
    couleur: '#FFB6C1',
    icone: '💄'
  },

  // 💰 FINANCES
  {
    nom_categorie: 'Revenus',
    description: 'Salaire, primes, revenus',
    couleur: '#98D8C8',
    icone: '💰'
  },
  {
    nom_categorie: 'Épargne',
    description: 'Livret A, investissements',
    couleur: '#F7DC6F',
    icone: '🏦'
  },
  {
    nom_categorie: 'Impôts & Taxes',
    description: 'Impôts, taxes diverses',
    couleur: '#CD5C5C',
    icone: '📋'
  },

  // 📦 DIVERS
  {
    nom_categorie: 'Autres',
    description: 'Dépenses diverses non catégorisées',
    couleur: '#AED6F1',
    icone: '📦'
  }
];

// ✅ FONCTION UNIQUE qui fait tout
async function seedDatabase() {
  try {
    console.log('🌱 === SEEDING DE LA BASE DE DONNÉES ===');

    // 1. ✅ Seeding des catégories
    console.log('\n🍽️ Création des 30 catégories système...');
    let categoriesCreated = 0;
    let categoriesExisting = 0;

    for (const categorieData of CATEGORIES_SYSTEME) {
      const [categorie, wasCreated] = await Categorie.findOrCreate({
        where: { nom_categorie: categorieData.nom_categorie },
        defaults: categorieData
      });

      if (wasCreated) {
        console.log(`✅ Catégorie créée: ${categorie.nom_categorie} ${categorieData.icone}`);
        categoriesCreated++;
      } else {
        console.log(`ℹ️  Existe déjà: ${categorie.nom_categorie}`);
        categoriesExisting++;
      }
    }

    // 2. ✅ Seeding des alertes
    console.log('\n🚨 Création des templates d\'alertes...');
    let alertesCreated = 0;
    let alertesExisting = 0;

    for (const alerteData of ALERTES_TEMPLATES) {
      const [alerte, wasCreated] = await Alerte.findOrCreate({
        where: { type_alerte: alerteData.type_alerte },
        defaults: alerteData
      });

      if (wasCreated) {
        console.log(`✅ Template créé: ${alerte.type_alerte}`);
        alertesCreated++;
      } else {
        console.log(`ℹ️  Existe déjà: ${alerte.type_alerte}`);
        alertesExisting++;
      }
    }

    // 3. ✅ Résumé final
    console.log('\n🎉 === SEEDING TERMINÉ ===');
    console.log(`📊 CATÉGORIES: ${categoriesCreated} créées, ${categoriesExisting} existantes (Total: ${CATEGORIES_SYSTEME.length})`);
    console.log(`📊 ALERTES: ${alertesCreated} créées, ${alertesExisting} existantes (Total: ${ALERTES_TEMPLATES.length})`);
    console.log('✅ Base de données prête pour l\'application !');

  } catch (error) {
    console.error('❌ Erreur during seeding:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit();
  }
}


seedDatabase();