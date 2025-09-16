import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './services/supabase.service';

// --- Angular Forms Modules ---
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// --- Angular Material modules ---
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// --- Ag-Grid ---
import { AgGridModule } from 'ag-grid-angular';

// --- Ngx-Datatable ---
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

// Composants
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AccueilComponent } from './accueil/accueil.component';
import { MaitreOuvrageComponent } from './maitre-ouvrage/maitre-ouvrage.component';
import { RegisterComponent } from './register/register.component';
import { SignatureElectroniqueComponent } from './signature-electronique/signature-electronique.component';
import { TelechargementPvComponent } from './telechargement-pv/telechargement-pv.component';
import { ChefProjetComponent } from './chef-projet/chef-projet.component';
import { MieuxOffrantComponent } from './mieux-offrant/mieux-offrant.component';
import { CommunicationFournisseursComponent } from './communication-fournisseurs/communication-fournisseurs.component';
import { FournisseurComponent } from './pages/fournisseur/fournisseur.component';
import { SoumissionComponent } from './pages/soumission/soumission.component';
import { ConsulterResultatComponent } from './espace-fournisseur/consulter-resultat/consulter-resultat.component';
import { MotDePasseComponent } from './mot-de-passe/mot-de-passe.component';
import { ParametresComponent } from './parametres/parametres.component';
import { CentraliserDocumentsComponent } from './centraliser-documents/centraliser-documents.component';
import { SuivieDecompteComponent } from './suivie-decompte/suivie-decompte.component';
import { TelechargerDocumentComponent } from './telecharger-document/telecharger-document.component';

// Routes
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AuthGuard } from './auth.guard';

// ✅ Fonction d'initialisation de l'application
export function appInitializer(supabaseService: SupabaseService) {
  return () => {
    // Écoute l'état d'authentification de Supabase
    return new Promise<void>(resolve => {
      supabaseService.authEvents$.subscribe(event => {
        if (event) {
          console.log('Supabase auth event:', event);
          resolve();
        }
      });
      // S'il n'y a pas d'événement, on résout après un court délai pour éviter un blocage.
      setTimeout(() => resolve(), 3000); 
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AccueilComponent,
    MaitreOuvrageComponent,
    RegisterComponent,
    SignatureElectroniqueComponent,
    TelechargementPvComponent,
    ChefProjetComponent,
    MieuxOffrantComponent,
    SuivieDecompteComponent,
    FournisseurComponent,
    ParametresComponent,
    CentraliserDocumentsComponent,
    TelechargerDocumentComponent,
      SoumissionComponent,

   
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AgGridModule,
    NgxDatatableModule,
    RouterModule, 
  ],
  providers: [
    SupabaseService,
    AuthGuard,
    // ✅ Fournir la fonction d'initialisation de l'application
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      deps: [SupabaseService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
