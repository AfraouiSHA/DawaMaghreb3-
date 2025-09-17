// src/assets/vendors/scripts/define-shim.js
// Ce "shim" basique permet aux modules AMD simples de s'exécuter sans RequireJS.
if (typeof define === 'undefined') {
    window.define = function(deps, factory) {
        // Si c'est juste define(factory)
        if (typeof deps === 'function') {
            factory();
        }
        // Si c'est define(deps, factory) et qu'on ne gère pas de dépendances complexes
        else if (Array.isArray(deps) && typeof factory === 'function') {
            // Pour des cas simples, on exécute juste la fonction de fabrication.
            // Cela ne gérera pas les dépendances réelles, donc utilisez avec prudence.
            factory();
        }
    };
    // Très important : certains modules vérifient l'existence de define.amd
    define.amd = {};
}