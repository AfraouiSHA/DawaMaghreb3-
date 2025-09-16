import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ⭐⭐⭐ REMPLACEZ CES VALEURS PAR LES CLÉS DE VOTRE PROJET SUPABASE ⭐⭐⭐
const supabaseUrl = 'https://kfzlkfupyrokfimekkee.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmemxrZnVweXJva2ZpbWVra2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM2OTE3MSwiZXhwIjoyMDY1OTQ0MTcxfQ.fJ3dH_-hehJ8fdOOJAIF3byDnP1E1ZDYu4mOFCn84iY';
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RegisterComponent {
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private authService = inject(AuthService);

  user = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    profil: ''
  };

  confirmPassword: string = '';

  is2FAConfiguring = false;
  qrCodeUri = '';
  factorId = '';
  totpCode = '';
  mfaErrorMessage = '';
  challengeId = '';

  async onSubmit() {
    try {
      if (this.user.password !== this.confirmPassword) {
        this.toastr.error('Les mots de passe ne correspondent pas.', 'Erreur');
        return;
      }
      
      this.user.email = this.user.email.trim();

      // Étape 1 : Inscription de l'utilisateur
      const { data: signUpData, error: signUpError } = await this.authService.signUp(this.user.email, this.user.password);
      if (signUpError) {
        throw signUpError;
      }
      
      // Étape 2 : Vérifier la session après l'inscription
      const { data, error: sessionError } = await supabase.auth.getSession();
      const currentUser = data?.session?.user; // Correctement accéder à l'utilisateur
      
      if (sessionError || !currentUser) {
        this.toastr.success('Inscription réussie ! Veuillez vérifier votre e-mail pour confirmer votre compte.', 'Confirmation requise');
        this.router.navigate(['/login']);
        return;
      }

      // Étape 3 : Mise à jour du profil de l'utilisateur avec les informations du formulaire
      const { data: profileData, error: profileUpdateError } = await this.authService.updateProfileDetails(
        currentUser.id,
        {
          nom: this.user.nom,
          prenom: this.user.prenom,
          role: this.user.profil
        }
      );

      if (profileUpdateError) {
        console.warn('Erreur lors de la sauvegarde du profil, mais l\'utilisateur est inscrit:', profileUpdateError);
        this.toastr.warning('Compte créé, mais erreur lors de la sauvegarde de vos informations. Veuillez modifier votre profil plus tard.', 'Profil incomplet');
      }

      // Étape 4 : Enrôlement de la 2FA
      this.toastr.success('Votre compte a été créé avec succès. Veuillez configurer la 2FA.', 'Succès');

      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (enrollError) {
        this.mfaErrorMessage = 'Erreur lors de l’activation du 2FA: ' + enrollError.message;
        console.error('Erreur d’enrôlement MFA:', enrollError);
        return;
      }

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollData.id,
      });

      if (challengeError) {
        this.mfaErrorMessage = 'Erreur lors du challenge du 2FA: ' + challengeError.message;
        console.error('Erreur de challenge MFA:', challengeError);
        return;
      }

      this.is2FAConfiguring = true;
      this.qrCodeUri = enrollData.totp.uri;
      this.factorId = enrollData.id;
      this.challengeId = challengeData.id;
      console.log('Facteur 2FA enrôlé. URI:', enrollData.totp.uri);

    } catch (error: any) {
      console.error('Erreur lors de la création du compte :', error);
      let message = 'Une erreur est survenue. Veuillez réessayer.';
      if (error && error.message) {
        if (error.message.includes('User already registered') || error.message.includes('email already registered')) {
          message = 'Cette adresse e-mail est déjà utilisée.';
        } else if (error.message.includes('invalid format')) {
          message = 'Le format de l\'adresse e-mail est invalide.';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          message = 'Le mot de passe est trop faible (minimum 6 caractères).';
        } else {
          message = 'Erreur: ' + error.message;
        }
      }
      this.toastr.error(message, 'Erreur');
    }
  }

  async verify2FACode(): Promise<void> {
    this.mfaErrorMessage = '';

    if (!this.totpCode || this.totpCode.length !== 6) {
      this.mfaErrorMessage = 'Veuillez saisir un code TOTP valide à 6 chiffres.';
      return;
    }

    const { data, error } = await supabase.auth.mfa.verify({
      factorId: this.factorId,
      challengeId: this.challengeId,
      code: this.totpCode,
    });

    if (error) {
      this.mfaErrorMessage = 'Code de vérification incorrect. Veuillez réessayer.';
      console.error('Erreur de vérification MFA:', error);
      return;
    }

    this.toastr.success('2FA activée avec succès ! Vous pouvez maintenant vous connecter.', 'Succès');
    this.router.navigate(['/login']);
  }
}