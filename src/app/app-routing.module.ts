import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { AccueilComponent } from './accueil/accueil.component';
import { MaitreOuvrageComponent } from './maitre-ouvrage/maitre-ouvrage.component';
import { RegisterComponent } from './register/register.component';
import { SignatureElectroniqueComponent } from './Views/signature-electronique/signature-electronique.component';
import { TelechargementPvComponent } from './telechargement-pv/telechargement-pv.component';
import { ChefProjetComponent } from './chef-projet/chef-projet.component';
import { FournisseurComponent } from './pages/fournisseur/fournisseur.component';
import { SuiviDecomptesComponent } from './chef-de-projet/suivi-decomptes/suivi-decomptes.component';
const routes: Routes = [
  { path: 'fournisseur', component: FournisseurComponent },

  { path: '', redirectTo: 'accueil', pathMatch: 'full' },

  // Routes publiques
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Routes sécurisées
  { path: 'accueil', component: AccueilComponent },
  { path: 'maitre-ouvrage', component: MaitreOuvrageComponent },
  { path: 'telechargement-pv', component: TelechargementPvComponent },
  { path: 'signature-electronique', component: SignatureElectroniqueComponent },
  { path: 'chef-projet', component: ChefProjetComponent },
  { path: 'fournisseur', component: FournisseurComponent },
  
  // Fallback
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
('ng,fournisseur.componenet.ts');