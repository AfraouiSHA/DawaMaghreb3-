import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent {
  constructor(private router: Router) { }

  // Méthodes de redirection pour chaque rôle
  goToMaitreOuvrage() {
    this.router.navigate(['/maitre-ouvrage']);  // Redirection vers la page Maître d’ouvrage
  }

  goToChefDeProjet() {
    this.router.navigate(['/chef-de-projet']);  // Redirection vers la page Chef de projet
  }

  goToFournisseur() {
    this.router.navigate(['/fournisseur']);  // Redirection vers la page Fournisseur
  }
}

