const mainController = {

  home: function(req, res) {
    res.json({
      page: 'home',
      title: 'Accueil'
    });
  },

  legal: function(req, res) {
    res.json({
      page: 'legal',
      title: 'Mentions légales',
    });
  },

  about: function(req, res) {
    res.json({
      page: 'about',
      title: 'A propos',
    });
  },

  contact: function(req, res) {
    res.json({
      page: 'contact',
      title: 'Contact',
    });
  },

  dashboard: function(req, res) {
    res.json({
      page: 'dashboard',
      title: 'Tableau de bord',
    });
  },

  account: function(req, res) {
    res.json({
      page: 'account',
      title: 'Mon compte',
    });
  },

  notFound: function(req, res) {
    res.status(404).json({
      success: false,
      message: 'La page demandée n\'a pas été trouvée.',
    });
  }

};

export default mainController;