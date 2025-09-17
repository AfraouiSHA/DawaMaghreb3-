const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery', // Pour s'assurer que jQuery est bien disponible globalement
      // Ajoutez les lignes suivantes pour Bootstrap 4 si nécessaire
      // Popper: ['popper.js', 'default'], // Souvent inclus dans bootstrap.bundle.min.js, mais utile si problème
      // 'window.Popper': ['popper.js', 'default']
      // Il n'y a pas d'objet global 'bootstrap' directement utilisable ici,
      // mais s'assurer de jQuery et Popper résout souvent le problème
    })
  ]
};