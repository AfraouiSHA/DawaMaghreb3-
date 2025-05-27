import { Component } from '@angular/core'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-chef-projet',
  templateUrl: './chef-projet.component.html',
  styleUrls: ['./chef-projet.component.css']
})
export class ChefProjetComponent {
  message = 'Bienvenue dans l’espace Chef de projet';

  constructor(private router: Router) {}

  allerAuSuiviDecompte() {
    console.log('Redirection vers la page Suivi de décompte');
    this.router.navigate(['/suivie-decompte']);
  }

  allerAuMieuxOffrant() {
    console.log('Redirection vers la page Mieux Offrant');
    this.router.navigate(['/mieux-offrant']);
  }

  allerAuCommunicationFournisseurs() {
    console.log('Redirection vers la page Communication fournisseurs');
    this.router.navigate(['/communication-fournisseurs']);  // Assure-toi que cette route existe
  }
}
