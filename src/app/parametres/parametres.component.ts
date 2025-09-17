import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Router } from '@angular/router';

type EntrepriseKeys = 'nom' | 'ice' | 'adresse' | 'email' | 'telephone';
type UserKeys = 'prenom' | 'nom' | 'poste' | 'email' | 'telephone';

// ⭐ REMPLACEZ CES VALEURS PAR LES CLÉS DE VOTRE PROJET SUPABASE ⭐
const supabaseUrl = 'https://kfzlkfupyrokfimekkee.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmemxrZnVweXJva2ZpbWVra2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM2OTE3MSwiZXhwIjoyMDY1OTQ0MTcxfQ.fJdH_-hehJ8fdOOJAIF3byDnP1E1ZDYu4mOFCn84iY';

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.css']
})
export class ParametresComponent implements OnInit {

  objectKeys = Object.keys;

  sections = [
    { key: 'profil', label: 'Profil de l’utilisateur', icon: 'fas fa-user-circle' },
    { key: 'securite', label: 'Sécurité', icon: 'fas fa-shield-alt' },
    { key: 'historique', label: 'Historique de connexion', icon: 'fas fa-history' },
    { key: 'deconnexion', label: 'Déconnexion', icon: 'fas fa-sign-out-alt' }
  ];

  selectedSection: string = 'profil';
  isLoading: boolean = false;
  loginHistory: any[] = [];
  user: Record<UserKeys, string> = {
    prenom: '',
    nom: '',
    poste: '',
    email: '',
    telephone: ''
  };

  userLabels: Record<UserKeys, string> = {
    prenom: 'Prénom',
    nom: 'Nom',
    poste: 'Poste',
    email: 'Adresse email',
    telephone: 'Numéro de téléphone'
  };

  get userKeys(): UserKeys[] {
    return Object.keys(this.user) as UserKeys[];
  }

  entreprise: Record<EntrepriseKeys, string> = {
    nom: '',
    ice: '',
    adresse: '',
    email: '',
    telephone: ''
  };

  entrepriseLabels: Record<EntrepriseKeys, string> = {
    nom: 'Nom de l’entreprise',
    ice: 'ICE',
    adresse: 'Adresse',
    email: 'Email de l’entreprise',
    telephone: 'Numéro de téléphone'
  };

  get entrepriseKeys(): EntrepriseKeys[] {
    return Object.keys(this.entreprise) as EntrepriseKeys[];
  }

  theme: 'light' | 'dark' = 'light';
  passwordStrength = 0;
  passwordStrengthText = 'Faible';
  passwordSuccessMessage = '';
  passwordErrorMessage = '';

  isEmailValid = true;
  isTelephoneValid = true;
  isEntrepriseEmailValid = true;
  isEntrepriseTelephoneValid = true;

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme as 'light' | 'dark');
    }
    if (this.selectedSection === 'historique') {
      this.getLoginHistory();
    }
  }

  selectSection(sectionKey: string): void {
    this.selectedSection = sectionKey;
    if (sectionKey === 'historique') {
      this.getLoginHistory();
    }
  }

  async getLoginHistory(): Promise<void> {
    this.isLoading = true;
    this.loginHistory = [];

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log("Aucun utilisateur connecté.");
      this.isLoading = false;
      return;
    }

    const { data, error } = await supabase
      .from('connexions')
      .select('created_at, adresse_ip, Mapsur_os')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    this.isLoading = false;

    if (error) {
      console.error("Erreur de Supabase:", error);
      return;
    }

    this.loginHistory = data || [];
  }

  async saveProfile(): Promise<void> {
    this.validateProfile();
    if (this.isEmailValid && this.isTelephoneValid && this.isEntrepriseEmailValid && this.isEntrepriseTelephoneValid) {
        const { data: userUpdateData, error: userUpdateError } = await supabase.from('users').update(this.user).eq('email', this.user.email);
        if (userUpdateError) {
            console.error('Erreur lors de la sauvegarde du profil utilisateur:', userUpdateError.message);
        } else {
            console.log('Profil utilisateur sauvegardé avec succès:', userUpdateData);
        }

        const { data: entrepriseUpdateData, error: entrepriseUpdateError } = await supabase.from('entreprises').update(this.entreprise).eq('email', this.entreprise.email);
        if (entrepriseUpdateError) {
            console.error('Erreur lors de la sauvegarde du profil entreprise:', entrepriseUpdateError.message);
        } else {
            console.log('Profil entreprise sauvegardé avec succès:', entrepriseUpdateData);
        }
    } else {
      console.log('Erreur de validation. Veuillez vérifier les champs.');
    }
  }

  validateProfile(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telephoneRegex = /^\d{10}$/;

    this.isEmailValid = emailRegex.test(this.user.email);
    this.isTelephoneValid = telephoneRegex.test(this.user.telephone);
    this.isEntrepriseEmailValid = emailRegex.test(this.entreprise.email);
    this.isEntrepriseTelephoneValid = telephoneRegex.test(this.entreprise.telephone);
  }

  checkPasswordStrength(): void {
    const password = this.newPassword;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    this.passwordStrength = strength;

    switch (strength) {
      case 0:
        this.passwordStrengthText = 'Faible';
        break;
      case 1:
        this.passwordStrengthText = 'Moyen';
        break;
      case 2:
        this.passwordStrengthText = 'Bon';
        break;
      case 3:
        this.passwordStrengthText = 'Fort';
        break;
      case 4:
        this.passwordStrengthText = 'Très fort';
        break;
      default:
        this.passwordStrengthText = 'Faible';
    }
  }

  isPasswordValid(): boolean {
    return (
      this.oldPassword.length > 0 &&
      this.newPassword.length >= 8 &&
      this.newPassword === this.confirmPassword
    );
  }

  getPasswordStrengthClass(): string {
    switch (this.passwordStrength) {
      case 1: return 'strength-weak';
      case 2: return 'strength-medium';
      case 3: return 'strength-strong';
      case 4: return 'strength-very-strong';
      default: return 'strength-none';
    }
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.theme = theme;
    document.body.className = `${theme}-theme`;
    localStorage.setItem('theme', theme);
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur de déconnexion:', error.message);
    } else {
      console.log('Déconnexion réussie. Redirection...');
      this.router.navigate(['/login']);
    }
  }

  savePassword(): void {
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    if (!this.isPasswordValid()) {
      this.passwordErrorMessage = 'Veuillez remplir tous les champs correctement. Le nouveau mot de passe doit faire au moins 8 caractères et correspondre à la confirmation.';
      return;
    }

    setTimeout(() => {
      console.log('Mot de passe mis à jour.');
      this.passwordSuccessMessage = 'Votre mot de passe a été mis à jour avec succès.';
      this.resetPasswordFields();
    }, 1000);
  }

  cancelEdit(): void {
    this.resetPasswordFields();
  }

  resetPasswordFields(): void {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordStrength = 0;
    this.passwordStrengthText = 'Faible';
    this.passwordErrorMessage = '';
  }
}