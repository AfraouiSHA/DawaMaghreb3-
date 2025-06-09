import { Component, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { FirebaseError } from 'firebase/app'; // 👉 Import pour typage précis des erreurs

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RegisterComponent {
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  user = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    profil: ''
  };

  async onSubmit() {
    try {
      await this.authService.register(this.user.email, this.user.password, this.user.profil);

      // ✅ Succès
      this.toastr.success('Votre compte a été créé avec succès !', 'Succès');
      this.router.navigate(['/login'], {
        state: { successMessage: 'Votre compte a été créé avec succès !' }
      });

    } catch (error: any) {
      console.error('Erreur lors de la création du compte :', error);

      let message = 'Une erreur est survenue. Veuillez réessayer.';

      // ✅ Gestion fine des erreurs Firebase
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            message = 'Cette adresse email est déjà utilisée.';
            break;
          case 'auth/invalid-email':
            message = 'Adresse email invalide.';
            break;
          case 'auth/weak-password':
            message = 'Le mot de passe est trop faible (minimum 6 caractères).';
            break;
          default:
            message = 'Erreur Firebase : ' + error.message;
            break;
        }
      }

      this.toastr.error(message, 'Erreur');
    }
  }
}
