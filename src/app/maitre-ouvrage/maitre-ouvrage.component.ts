import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-maitre-ouvrage',
  templateUrl: './maitre-ouvrage.component.html',
  styleUrls: ['./maitre-ouvrage.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule]
})
export class MaitreOuvrageComponent implements OnInit {
  documents: any[] = [];
  loading = false;
  error: string | null = null;
  public projectId: string | null = null;

  constructor(
    private router: Router,
    private readonly supabaseService: SupabaseService
    
  ) {}

   



   async ngOnInit(): Promise<void> {
    // 1) récupère le projet de l’utilisateur connecté
  const { data } = await this.supabaseService.getSession();
  const user = data?.session?.user;
  if (!user) return;

  this.projectId = await this.supabaseService.getOrCreateUserProjectId(user.id);
  if (!this.projectId) return;

  // 2) charge **uniquement** les PV à signer
  const { data: docs, error } = await this.supabaseService.getPvToSignForMaitreOuvrage(this.projectId);
  if (error) {
    this.error = error.message ?? 'Erreur inconnue';
  } else {
    this.documents = docs ?? [];
  }
}

  // Cette méthode charge les documents en appelant directement le service.
  private async loadDocuments(projectId: string): Promise<void> {
    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.getDocumentsByProjectId(projectId, {
        category: 'pv',
        statut: 'À signer'
      });

      if (error) {
        throw error;
      }

      this.documents = data ?? [];
      console.log("Documents à signer (stakeholders) :", this.documents);

    } catch (err: any) {
      this.error = err.message ?? 'Erreur inconnue';
      console.error('Erreur loadDocuments :', err);
    } finally {
      this.loading = false;
    }
  }

  telechargerDocument(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

 signerDocument(docId: string): void {
  const documentToSign = this.documents.find(doc => doc.id === docId);
  if (documentToSign && documentToSign.file_url) {
    console.log('🚀 Navigation vers signature avec :', {
      url: documentToSign.file_url,
      docId: documentToSign.id
    });

    this.router.navigate(['/signature-electronique'], {
      queryParams: {
        url: documentToSign.file_url,
        docId: documentToSign.id
      }
    });
  } else {
    console.error("Document ou URL du document introuvable.");
  }


   console.log('🚀 Navigation vers signature avec :', {
  url: documentToSign.file_url,
  docId: documentToSign.id
});
  }
  goToSignatureElectronique(): void {
    void this.router.navigate(['/signature-electronique']);
  }

 goToTelechargementDocuments(): void {
    if (!this.projectId) {
      console.error("Impossible de naviguer : l'ID du projet est manquant.");
      return;
    }
    this.router.navigate(['/telecharger-document'], {
      queryParams: { projectId: this.projectId }
    });
  }

   goToTelechargementPV(): void {
    if (!this.projectId) {
      console.error("Impossible de naviguer : l'ID du projet est manquant.");
      return;
    }
    // Passe l'ID du projet dans les paramètres de la route
    this.router.navigate(['/telechargement-pv'], { queryParams: { projectId: this.projectId } });
  }
}
