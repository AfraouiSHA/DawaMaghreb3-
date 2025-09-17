// disable-define-before-mousewheel.js

// Sauvegarder la définition AMD si elle existe
var tmpDefine = window.define;

// Supprimer temporairement window.define pour jquery.mousewheel
window.define = undefined;

// Rétablir window.define juste après le chargement de jquery.mousewheel
setTimeout(function() {
  window.define = tmpDefine;
}, 0);
