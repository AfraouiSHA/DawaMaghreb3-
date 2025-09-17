import { provideRouter, Routes } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
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
import { NgModule } from '@angular/core';
import { RouterModule} from '@angular/router';
import { RemplirInformationComponent } from './remplir-information/remplir-information.component'; // ⬅️ Importez le nouveau composant
import { InfoAoComponent } from './info-ao/info-ao.component';

// ✅ Réactivez l'import de l'AuthGuard en retirant les commentaires
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },

  // 🔓 Routes publiques
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 🔒 Routes sécurisées - AuthGuard RÉACTIVÉ en retirant les commentaires
  { path: 'accueil', component: AccueilComponent },
  { path: 'maitre-ouvrage', component: MaitreOuvrageComponent },
  { path: 'signature-electronique', component: SignatureElectroniqueComponent },
  { path: 'chef-projet', component: ChefProjetComponent },
  {
    path: 'communication-fournisseurs',
    component: CommunicationFournisseursComponent,
  
  },
  {
  path: 'soumission/:id',
  component: SoumissionComponent // ou ton composant de soumission
},
  { path: 'mieux-offrant', component: MieuxOffrantComponent },
  { path: 'fournisseur', component: FournisseurComponent },
  { path: 'consulter-resultat/:id_fournisseur', component: ConsulterResultatComponent },

 { path: 'mot-de-passe-oublie', component: MotDePasseComponent },
  { path: 'parametres', component: ParametresComponent },
  { path: 'suivie-decompte', component: SuivieDecompteComponent },
  { path: 'nouvel-ao', component: InfoAoComponent },
   
  { path: 'centraliser-documents', component: CentraliserDocumentsComponent },
   

  { path: 'telecharger-document', component: TelechargerDocumentComponent },
  { path: 'telechargement-pv', component: TelechargementPvComponent },
  { path: 'remplir-information/:id', component: RemplirInformationComponent }, // ⬅️ Mettez à jour la route
];



// ✅ À utiliser dans main.ts ou app.config.ts pour standalone routing
export const APP_ROUTES = provideRouter(routes);
