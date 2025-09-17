import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service'; // Importation de AuthService

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService // Injection du AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Affiche le message de succès si redirigé après création de compte
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { successMessage?: string };

    if (state?.successMessage) {
      this.toastr.success(state.successMessage, 'Succès');
    }
  }

  async onLogin(): Promise<void> {
    // Appel de la méthode de connexion Supabase.
    // L'authService.login retourne { error: Error | null },
    // donc nous vérifions directement l'objet 'error'.
    const { error } = await this.authService.login(this.email, this.password);

    if (error) {
      console.error('Erreur de connexion Supabase :', error);
      // Gérer les messages d'erreur plus spécifiques si nécessaire
      let errorMessage = 'Email ou mot de passe incorrect';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'Utilisateur non trouvé.';
      }
      this.toastr.error(errorMessage, 'Erreur');
    } else {
      // ✅ Connexion réussie via Supabase
      this.toastr.success('Connexion réussie', 'Bienvenue');

      // IMPORTANT: Le listener `onAuthStateChange` dans `AuthService`
      // va automatiquement récupérer le rôle de l'utilisateur et d'autres données de profil
      // de votre table 'profiles' après une connexion Supabase réussie.
      // Vous N'AVEZ PAS besoin d'assigner manuellement des rôles ou d'appeler `setCurrentUser` ici.
      // L'observable `currentUser$` dans AuthService sera mis à jour en interne.

      // ✅ Redirection vers la page d'accueil après login
      this.router.navigate(['/accueil']);
    }
  }

  allerVersRegister(event: Event) {
    event.preventDefault();
    this.router.navigate(['/register']);
  }
}
