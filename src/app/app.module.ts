// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // Importation nécessaire pour RouterModule.forRoot

// Import Handsontable Angular module (si vous l'utilisez toujours ailleurs, sinon à retirer)
import { HotTableModule } from '@handsontable/angular';

// Angular Material modules (si vous les utilisez, sinon à retirer)
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Import Ag-Grid (avec withComponents([]) si vous avez des Cell Renderers/Editors custom, sinon AgGridModule seul suffit)
// AG-Grid est déjà importé dans SoumissionComponent (standalone), donc ici c'est pour d'autres composants non standalone si besoin.
import { AgGridModule } from 'ag-grid-angular';

// Composants (Déclarer UNIQUEMENT les composants NON standalone)
import { AppComponent } from './app.component';
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
import { CentraliserDocumentsComponent } from './centraliser-documents/centraliser-documents.component';
import { DevisComponent } from './pages/devis/devis.component'; // Si DevisComponent est non standalone

// Importation du composant SoumissionComponent (standalone), non déclaré mais utilisé dans les routes
// import { SoumissionComponent } from './pages/soumission/soumission.component'; // Pas besoin d'importer ici si seulement dans les routes

import { SharedModule } from './shared/shared.module'; // Assurez-vous que ce module est utilisé et contient ce qu'il faut

// Firebase (compat) - S'assurer que 'environment' est bien configuré avec 'firebaseConfig'
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment'; // Chemin correct vers le fichier d'environnement

// Routing
import { routes } from './app.routes'; // Importation de vos routes

@NgModule({
  declarations: [
    // Retirer SoumissionComponent d'ici car il est 'standalone'
    AppComponent,
    LoginComponent,
    AccueilComponent,
    MaitreOuvrageComponent,
    RegisterComponent,
    SignatureElectroniqueComponent,
    TelechargementPvComponent,
    ChefProjetComponent,
    MieuxOffrantComponent,
    DevisComponent, // Déclarer si non standalone
    SuivieDecompteComponent,
    FournisseurComponent,
    ParametresComponent,
    CentraliserDocumentsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // Pour les services HTTP
    FormsModule, // Pour [(ngModel)] dans les formulaires classiques
    ReactiveFormsModule, // Si vous utilisez des Reactive Forms
    RouterModule.forRoot(routes), // Configure le routage pour l'application principale

    // Modules Firebase (compat) - Utilise environment.firebaseConfig
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,

    // Modules de librairies tierces (à inclure si d'autres composants non standalone les utilisent)
    HotTableModule,

    // Angular Material modules (à inclure si d'autres composants non standalone les utilisent)
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule, // Nécessaire pour MatDatepicker

    // AgGrid module (avec withComponents([]) si des Cell Renderers/Editors custom sont utilisés dans des composants non standalone)
    // Sinon, AgGridModule seul suffit.
    AgGridModule.withComponents([]), // Le withComponents([]) est correct ici.

    SharedModule // Assurez-vous que ce module est bien configuré et importé si nécessaire
  ],
  providers: [], // Ajoutez des services ici si besoin (ex: fournisseurs pour Angular Material Datepicker)
  bootstrap: [AppComponent], // Composant racine qui démarre l'application
  // Le schemas : [CUSTOM_ELEMENTS_SCHEMA] est supprimé comme demandé
})
export class AppModule {}


