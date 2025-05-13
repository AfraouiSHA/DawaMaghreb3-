import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService, ToastrModule } from 'ngx-toastr';  // Importer ToastrModule
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, ToastrModule]  // Importer ToastrModule ici
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onLogin() {
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(() => {
        this.toastr.success('Connexion réussie', 'Bienvenue');
        this.router.navigate(['/dashboard']);
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







  