import { provideRouter, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AccueilComponent } from './accueil/accueil.component';
import { MaitreOuvrageComponent } from './maitre-ouvrage/maitre-ouvrage.component';
import { RegisterComponent } from './register/register.component';
import { SignatureElectroniqueComponent } from './Views/signature-electronique/signature-electronique.component';
import { TelechargementPvComponent } from './telechargement-pv/telechargement-pv.component';
import { ChefProjetComponent } from './chef-projet/chef-projet.component';
import { MieuxOffrantComponent } from './mieux-offrant/mieux-offrant.component';
import { CommunicationFournisseursComponent } from './communication-fournisseurs/communication-fournisseurs.component';
import { FournisseurComponent } from './pages/fournisseur/fournisseur.component';
import { SoumissionComponent } from './pages/soumission/soumission.component';
import { ConsulterResultatComponent } from './espace-fournisseur/consulter-resultat/consulter-resultat.component';
import { MotDePasseComponent } from './mot-de-passe/mot-de-passe.component';
import { ParametresComponent } from './parametres/parametres.component';


import { SuivieDecompteComponent } from './suivie-decompte/suivie-decompte.component';



import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },

  // 🔓 Routes publiques
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 🔐 Routes sécurisées
  { path: 'accueil', component: AccueilComponent, canActivate: [AuthGuard] },
  { path: 'maitre-ouvrage', component: MaitreOuvrageComponent, canActivate: [AuthGuard] },
  { path: 'telechargement-pv', component: TelechargementPvComponent, canActivate: [AuthGuard] },
  { path: 'signature-electronique', component: SignatureElectroniqueComponent, canActivate: [AuthGuard] },
  { path: 'chef-projet', component: ChefProjetComponent, canActivate: [AuthGuard] },
  { path: 'communication-fournisseurs', component: CommunicationFournisseursComponent, canActivate: [AuthGuard] },
  { path: 'mieux-offrant', component: MieuxOffrantComponent, canActivate: [AuthGuard] },
  { path: 'fournisseur', component: FournisseurComponent, canActivate: [AuthGuard] },
  { path: 'soumission', component: SoumissionComponent, canActivate: [AuthGuard] },
  { path: 'fournisseur/consulter-resultat', component: ConsulterResultatComponent },
  { path: 'mot-de-passe-oublie', component: MotDePasseComponent },
  { path: 'parametres', component: ParametresComponent },
  { path: 'suivie-decompte', component: SuivieDecompteComponent },

  // 🔁 Fallback
  { path: '**', redirectTo: 'login' }
];

// ✅ À utiliser dans main.ts ou app.config.ts pour standalone routing
export const APP_ROUTES = provideRouter(routes);

