import { Component, OnInit } from '@angular/core';  
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';


@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {
  user: any = null;
  userRole: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.checkAccess();
  }

  checkAccess() {
    this.user = this.authService.getCurrentUser();

    if (!this.user) {
      // 🔒 Aucun utilisateur connecté, rediriger vers login
      this.router.navigate(['/login']);
    } else {
      this.userRole = this.user.role;
    }
  }

  // ✅ Accès temporaire sans contrôle de rôle, pour test
  goToMaitreOuvrage() {
    this.router.navigate(['/maitre-ouvrage']);
  }

  goToChefDeProjet() {
    this.router.navigate(['/chef-projet']); // corrigé: 'chef-projet' sans tiret supplémentaire
  }

  goToFournisseur() {
    this.router.navigate(['/fournisseur']);
  }
}
