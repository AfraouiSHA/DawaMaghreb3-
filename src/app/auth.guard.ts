import { Injectable, inject } from '@angular/core'; 
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  canActivate() {
    return this.supabaseService.currentUser$.pipe(
      take(1),
      map(user => {
        console.log('AuthGuard - utilisateur connecté:', user);
        if (user) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
