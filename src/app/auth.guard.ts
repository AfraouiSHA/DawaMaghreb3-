import { Injectable, inject } from '@angular/core'; 
import { CanActivate, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private auth = inject(Auth);
  private router = inject(Router);

  canActivate() {
    return true;(
      take(1), // Attend la réponse Firebase
      map(user => {
        console.log('AuthGuard - utilisateur connecté:', user);
        if (user) {
          return true;  // Autorisation accordée
        } else {
          this.router.navigate(['/login']);  // Redirection vers login
          return false;
        }
      })
    );
  }
}

