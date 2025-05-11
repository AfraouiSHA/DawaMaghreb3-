import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule],
})
export class RegisterComponent {
  private auth = inject(Auth);

  user = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    profil: ''
  };

  onSubmit() {
    createUserWithEmailAndPassword(this.auth, this.user.email, this.user.password)
      .then(userCredential => {
        console.log('Utilisateur inscrit :', userCredential.user);
      })
      .catch(error => {
        console.error('Erreur lors de l’inscription :', error);
      });
  }
}

