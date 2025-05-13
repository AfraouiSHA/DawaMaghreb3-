import { Component, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule],
})
export class RegisterComponent {
  private auth = inject(Auth);
  private toastr = inject(ToastrService);
  private router = inject(Router);

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
        this.toastr.success('Compte créé avec succès', 'Succès');
        
        this.router.navigate(['/login']);
      })
      .catch(error => {
        console.error('Erreur lors de l’inscription :', error);
        this.toastr.error('Erreur lors de la création du compte', 'Erreur');
      });
  }
}


