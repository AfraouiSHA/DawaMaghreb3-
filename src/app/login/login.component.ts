import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../Service/auth.service';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    private auth: Auth,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // ✅ Affiche le message de succès si redirigé après création de compte
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { successMessage?: string };

    if (state?.successMessage) {
      this.toastr.success(state.successMessage, 'Succès');
    }
  }

  onLogin() {
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(userCredential => {
        const user = userCredential.user;

        // ✅ Récupération temporaire du rôle selon l'email
        let role = '';
        if (this.email.includes('maitre')) {
          role = 'maitre-ouvrage';
        } else if (this.email.includes('chef')) {
          role = 'chef-de-projet';
        } else if (this.email.includes('fournisseur')) {
          role = 'fournisseur';
        }

        // ✅ Sauvegarde utilisateur dans le service
        this.authService.setCurrentUser({
          email: user.email || '',
          uid: user.uid,
          role: role
        });

        this.toastr.success('Connexion réussie', 'Bienvenue');

        // ✅ Redirection vers la page d'accueil SEULEMENT après login
        this.router.navigate(['/accueil']);
      })
      .catch(error => {
        console.error('Erreur de connexion :', error);
        this.toastr.error('Email ou mot de passe incorrect', 'Erreur');
      });
  }

  allerVersRegister(event: Event) {
    event.preventDefault();
    this.router.navigate(['/register']);
  }
}






  