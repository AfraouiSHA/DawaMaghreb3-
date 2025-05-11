import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { from, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private auth = inject(Auth);
  private router = inject(Router);

  canActivate() {
    return from(
      new Promise<boolean>((resolve) => {
        onAuthStateChanged(this.auth, (user) => {
          if (user) {
            resolve(true);
          } else {
            this.router.navigate(['/login']);
            resolve(false);
          }
        });
      })
    );
  }
}
