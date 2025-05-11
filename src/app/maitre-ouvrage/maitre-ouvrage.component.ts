import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';  // Import du Router pour la navigation

@Component({
  selector: 'app-maitre-ouvrage',
  templateUrl: './maitre-ouvrage.component.html',
  styleUrls: ['./maitre-ouvrage.component.css']
})
export class MaitreOuvrageComponent implements OnInit {

  constructor(private router: Router) { }  // Injection du Router

  ngOnInit(): void {}

  // Méthode pour rediriger vers la page de signature électronique
  goToSignatureElectronique(): void {
    this.router.navigate(['/signature-electronique']);
  }

  // Méthode pour rediriger vers la page de téléchargement du PV
  goToTelechargementPV(): void {
    this.router.navigate(['/telechargement-pv']);
  }

}
