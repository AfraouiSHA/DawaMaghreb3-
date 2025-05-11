import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AccueilComponent } from './accueil/accueil.component';
import { MaitreOuvrageComponent } from './maitre-ouvrage/maitre-ouvrage.component';
import { TelechargementPvComponent } from './telechargement-pv/telechargement-pv.component';
import { SignatureElectroniqueComponent } from './signature-electronique/signature-electronique.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'accueil', component: AccueilComponent },
  { path: 'maitre-ouvrage', component: MaitreOuvrageComponent },
  { path: 'telechargement-pv', component: TelechargementPvComponent },
  { path: 'signature-electronique', component: SignatureElectroniqueComponent },
];

export const APP_ROUTES = provideRouter(routes);
