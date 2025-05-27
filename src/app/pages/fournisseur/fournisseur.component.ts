import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fournisseur',
  templateUrl: './fournisseur.component.html',
  styleUrls: ['./fournisseur.component.css']
})
export class FournisseurComponent {

  constructor(private router: Router) {}

  allerASoumission() {
    console.log('Redirection vers la page Soumission');
    this.router.navigate(['/soumission']);
  }

  allerAConsulterResultat() {
    console.log('Redirection vers la page Consulter Résultat');
    this.router.navigate(['/fournisseur/consulter-resultat']);
  }
}



