import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router) {}

  allerVersRegister(event: Event) {
    event.preventDefault(); // Empêche le rechargement de la page
    this.router.navigate(['/register']); // Redirige vers la page de création de compte
  }
}






  