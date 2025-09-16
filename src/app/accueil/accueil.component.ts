import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../service/auth.service';
import { SupabaseService } from '../services/supabase.service';
import { Subject } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit, OnDestroy {
  user: UserProfile | null = null;
  userRole: string = '';
  projectId: string | null = null; 

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router, 
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) { }

  async ngOnInit(): Promise<void> {
    const { data: { session } } = await this.supabaseService.getClient().auth.getSession();

    if (session) {
      this.authService.currentUser$
        .pipe(
          takeUntil(this.destroy$),
          filter(user => !!user),
          take(1)
        )
        .subscribe(user => {
          this.user = user;
          this.userRole = user!.role;
          console.log('User logged in:', this.user.email, 'Role:', this.userRole);
          this.getOrCreateProject(user!.id);
        });
    } else {
      console.log('No user logged in.');
      this.userRole = '';
    }
  }

  private async getOrCreateProject(userId: string): Promise<void> {
    try {
      const projectId = await this.supabaseService.getOrCreateUserProjectId(userId);
      if (projectId) {
        this.projectId = projectId;
      } else {
        console.error('Erreur: Impossible de récupérer ou de créer l\'ID du projet.');
      }
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToMaitreOuvrage() {
    if (this.userRole === 'maitre-ouvrage' || this.userRole === 'admin') {
      if (this.projectId) {
        this.router.navigate(['/centraliser-documents', { projectId: this.projectId }]);
      } else {
        console.warn('Cannot navigate: projectId is not set.');
      }
    } else {
      console.warn('Access denied: User is not Maitre Ouvrage.');
    }
  }

  goToChefDeProjet() {
    if (this.userRole === 'chef-de-projet' || this.userRole === 'admin') {
      if (this.projectId) {
        this.router.navigate(['/centraliser-documents', { projectId: this.projectId }]);
      } else {
        console.warn('Cannot navigate: projectId is not set.');
      }
    } else {
      console.warn('Access denied: User is not Chef de Projet.');
    }
  }

  goToFournisseur() {
    if (this.userRole === 'fournisseur' || this.userRole === 'admin') {
      if (this.projectId) {
        this.router.navigate(['/centraliser-documents', { projectId: this.projectId }]);
      } else {
        console.warn('Cannot navigate: projectId is not set.');
      }
    } else {
      console.warn('Access denied: User is not Fournisseur.');
    }
  }
}