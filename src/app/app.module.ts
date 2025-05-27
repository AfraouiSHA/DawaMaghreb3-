import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';

// Composants
import { LoginComponent } from './login/login.component';
import { AccueilComponent } from './accueil/accueil.component';
import { MaitreOuvrageComponent } from './maitre-ouvrage/maitre-ouvrage.component';
import { RegisterComponent } from './register/register.component';
import { SignatureElectroniqueComponent } from './Views/signature-electronique/signature-electronique.component';
import { TelechargementPvComponent } from './telechargement-pv/telechargement-pv.component';
import { ChefProjetComponent } from './chef-projet/chef-projet.component';
import { MieuxOffrantComponent } from './mieux-offrant/mieux-offrant.component';
import { SuivieDecompteComponent } from './suivie-decompte/suivie-decompte.component';
import { FournisseurComponent } from './pages/fournisseur/fournisseur.component';
import { ParametresComponent } from './parametres/parametres.component';


// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

// Routing
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    FournisseurComponent,
    LoginComponent,
    AccueilComponent,
    MaitreOuvrageComponent,
    RegisterComponent,
    SignatureElectroniqueComponent,
    TelechargementPvComponent,
    SuivieDecompteComponent,
    MieuxOffrantComponent,
    ParametresComponent,
    ChefProjetComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
