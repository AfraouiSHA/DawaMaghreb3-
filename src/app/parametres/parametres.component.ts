import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Déclaration du type en dehors de la classe
type EntrepriseKeys = 'nom' | 'ice' | 'adresse' | 'email' | 'telephone';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.css']
})
export class ParametresComponent {

  // Pour ngFor sur les clés de l'objet entreprise
  objectKeys = Object.keys;

  // Sections disponibles
  sections = [
    { key: 'profil', label: 'Profil de l’entreprise' },
    { key: 'securite', label: 'Sécurité' },
    { key: 'historique', label: 'Historique de connexion' },
    { key: 'deconnexion', label: 'Déconnexion' }
  ];

  // Section affichée par défaut
  selectedSection: string = 'profil';

  // Données de l'entreprise
  entreprise: Record<EntrepriseKeys, string> = {
    nom: '',
    ice: '',
    adresse: '',
    email: '',
    telephone: ''
  };

  get entrepriseKeys(): EntrepriseKeys[] {
    return Object.keys(this.entreprise) as EntrepriseKeys[];
  }

  // Sécurité
  is2FAEnabled = false;
  theme: 'light' | 'dark' = 'light';
  passwordStrength = 0;
  passwordStrengthText = 'Faible';

  // Historique de connexion
  loginHistory = [
    { date: new Date(), ip: '192.168.1.1', browser: 'Chrome (Windows)' },
    { date: new Date(Date.now() - 86400000), ip: '192.168.1.2', browser: 'Firefox (Mac)' }
  ];

  // Modal de mot de passe (version modale ou inline)
  showPasswordModal = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  oldPassword = '';

  hasMinLength = false;
  hasUpperCase = false;
  hasNumber = false;
  hasSpecialChar = false;

  editMode = false;

  // Modal
  openPasswordModal(): void {
    this.showPasswordModal = true;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.resetPasswordFields();
  }

  resetPasswordFields(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.oldPassword = '';
    this.passwordStrength = 0;
    this.passwordStrengthText = 'Faible';
  }

  checkPasswordStrength(): void {
    this.hasMinLength = this.newPassword.length >= 8;
    this.hasUpperCase = /[A-Z]/.test(this.newPassword);
    this.hasNumber = /\d/.test(this.newPassword);
    this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.newPassword);

    const strength = [
      this.hasMinLength,
      this.hasUpperCase,
      this.hasNumber,
      this.hasSpecialChar
    ].filter(Boolean).length;

    this.passwordStrength = strength;
    this.passwordStrengthText = ['Faible', 'Moyen', 'Fort', 'Très fort'][strength - 1] || 'Faible';
  }

  isPasswordValid(): boolean {
    return (
      this.passwordStrength >= 3 &&
      this.newPassword === this.confirmPassword &&
      (this.currentPassword.trim() !== '' || this.oldPassword.trim() !== '')
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
    // TODO : Ajouter persistance via localStorage
  }

  logout(): void {
    console.log('Déconnexion...');
  }

  savePassword(): void {
    if (this.isPasswordValid()) {
      // Logique d’envoi backend ici
      console.log('Mot de passe modifié avec succès');
      this.editMode = false;
      this.resetPasswordFields();
    } else {
      console.log('Mot de passe invalide');
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    this.resetPasswordFields();
  }
}



