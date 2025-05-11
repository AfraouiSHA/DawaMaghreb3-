import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { AccueilComponent } from './accueil/accueil.component';
import { MaitreOuvrageComponent } from './maitre-ouvrage/maitre-ouvrage.component';

import { HomeComponent } from './Views/home.component';
import { RegisterComponent } from './register/register.component';
import { SignatureElectroniqueComponent } from './Views/signature-electronique/signature-electronique.component';
import { TelechargementPvComponent } from './telechargement-pv/telechargement-pv.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'accueil', component: AccueilComponent },
  { path: 'maitre-ouvrage', component: MaitreOuvrageComponent },
  { path: 'telechargement-pv', component: TelechargementPvComponent },
  
  { path: 'signature-electronique', component: SignatureElectroniqueComponent },
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

