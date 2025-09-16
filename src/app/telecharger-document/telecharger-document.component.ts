import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from '../services/supabase.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Params } from '@angular/router';
interface DocumentAO {
  id?: string;
  nom: string;
  date: string;
  auteur: string;
  url: string;
  ao: string;
  category: string;
}

@Component({
  selector: 'app-telecharger-document',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './telecharger-document.component.html',
  styleUrls: ['./telecharger-document.component.css']
})
export class TelechargerDocumentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  numeroAO: string = 'votre_id_de_projet';
  rechercheMotCle: string = '';

  // AJOUTEZ CETTE LIGNE
    dossierAvis: DocumentAO[] = [];
  dossierAdministratif: DocumentAO[] = [];
  dossierTechnique: DocumentAO[] = [];
  dossierFinancier: DocumentAO[] = [];
  dossierPv: DocumentAO[] = [];
  dossierAutres: DocumentAO[] = [];

  listeAO: string[] = ['AO-2025-001', 'AO-2025-002', 'AO-2025-003'];

  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: string = '';
  previewUrl: string | null = null;

  constructor(private supabaseService: SupabaseService, private http: HttpClient,private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
        this.numeroAO = params['projectId'];
        if (this.numeroAO) {
          this.loadDocuments();
        } else {
          console.error('[TelechargerDocument] ID du projet manquant.');
        }
    });

    this.supabaseService.documentUpdated$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadDocuments();
    });

   
    this.supabaseService.documentUpdated$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadDocuments();
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

   async loadDocuments() {
    this.dossierAvis = [];
    this.dossierAdministratif = [];
    this.dossierTechnique = [];
    this.dossierFinancier = [];
    const projectId = this.numeroAO;

    if (projectId) {
      const { data, error } = await this.supabaseService.getDataByProjectId(projectId);

      if (error) {
        console.error('Erreur de chargement des documents :', error);
        return;
      }

      // ➡️ AJOUTEZ CETTE VÉRIFICATION
      if (data) {
        data.forEach((doc: any) => {
          const newDoc: DocumentAO = {
            id: doc.id,
            nom: doc.file_name,
            date: new Date(doc.created_at).toLocaleDateString(),
            auteur: doc.stakeholder,
            url: doc.file_url,
            ao: doc.project_id,
            category: doc.category
          };

          switch (doc.category) {
            case 'avis':
              this.dossierAvis.push(newDoc);
              break;
            case 'administratifs':
              this.dossierAdministratif.push(newDoc);
              break;
            case 'techniques':
              this.dossierTechnique.push(newDoc);
              break;
            case 'financiers':
              this.dossierFinancier.push(newDoc);
              break;
            
            case 'autres':
              this.dossierAutres.push(newDoc);
              break;
          }
        });
      }
    }
  }
  choisirAO(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.numeroAO = selectElement.value;
    this.rechercherDocuments();
  }

  rechercherDocuments() {
    this.loadDocuments();
  }

  getFilteredDocuments(docs: DocumentAO[]) {
    return docs.filter(doc => {
      const matchMotCle = this.rechercheMotCle
        ? doc.nom.toLowerCase().includes(this.rechercheMotCle.toLowerCase())
        : true;
      return matchMotCle;
    });
  }

  telechargerDocument(doc: DocumentAO): void {
    if (doc.url) {
      this.http.get(doc.url, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.nom || 'document';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: () => {
          this.openModal('error', 'Erreur de téléchargement', `Impossible de télécharger "${doc.nom}".`);
        }
      });
    }
  }

  previewDocument(doc: DocumentAO): void {
    if (doc.url) {
      this.previewUrl = doc.url;
    }
  }

  closePreview(): void {
    this.previewUrl = null;
  }

  async telechargerTout() {
    const allDocs = [...this.dossierAvis, ...this.dossierAdministratif, ...this.dossierTechnique, ...this.dossierFinancier];
    if (allDocs.length > 0) {
      for (const doc of allDocs) {
        this.telechargerDocument(doc);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      this.openModal('success', 'Téléchargement groupé', 'Tous les documents ont été téléchargés.');
    } else {
      this.openModal('info', 'Information', 'Aucun document à télécharger.');
    }
  }

  openModal(type: 'success' | 'error' | 'info', title: string, message: string) {
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}