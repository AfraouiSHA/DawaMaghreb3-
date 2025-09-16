import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocalDbService } from '../service/local-db.service';
import { SupabaseService } from '../services/supabase.service';
import { User } from '@supabase/supabase-js';

interface FichierUpload {
  nom: string;
  url: string;
  type?: string;
  taille?: number;
  category?: string;
  date?: string; 
  auteur?: string;
  statut?: 'En attente' | 'Validé' | 'Refusé';
  commentaire?: string;
}

interface DocumentSections {
  administratifs: FichierUpload[];
  financiers: FichierUpload[];
  techniques: FichierUpload[];
  autres: FichierUpload[];
}

@Component({
  selector: 'app-centraliser-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, NgIf],
  templateUrl: './centraliser-documents.component.html',
  styleUrls: ['./centraliser-documents.component.css'],
})
export class CentraliserDocumentsComponent implements OnInit, OnDestroy {
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'success';

  fichiersMaitreOuvrage: DocumentSections = {
    administratifs: [],
    financiers: [],
    techniques: [],
    autres: [],
  };
  fichiersFournisseurs: DocumentSections = {
    administratifs: [],
    financiers: [],
    techniques: [],
    autres: [],
  };
  
  isDragOverMOA: { [key: string]: boolean } = {};
  isDragOverF: { [key: string]: boolean } = {};

  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  nomDocumentsRecherche: string = '';
  documentsFiltresMOA: FichierUpload[] = [];
  documentsFiltresF: FichierUpload[] = [];

  constructor(
    private localDbService: LocalDbService,
    private http: HttpClient,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit(): Promise<void> {
    this.supabaseService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
    
    this.fichiersMaitreOuvrage.administratifs = [
      { nom: 'contrat-moa.pdf', url: '#', date: '2025-08-11', auteur: 'Admin', statut: 'Validé', commentaire: 'Commentaire par défaut' }
    ];
    this.fichiersMaitreOuvrage.techniques = [
      { nom: 'plan-batiment.png', url: '#', date: '2025-08-10', auteur: 'Admin', statut: 'En attente', commentaire: '' }
    ];
    
    this.rechercherDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    this.cleanupBlobUrls(this.fichiersMaitreOuvrage);
    this.cleanupBlobUrls(this.fichiersFournisseurs);
  }

  private cleanupBlobUrls(sections: DocumentSections): void {
    Object.values(sections).forEach(fileList => {
      fileList.forEach((fichier: FichierUpload) => {
        if (fichier.url && fichier.url.startsWith('blob:')) {
          URL.revokeObjectURL(fichier.url);
        }
      });
    });
  }

  onFileChange(event: Event, type: 'fournisseur' | 'maitreOuvrage', category: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.openModal('warning', 'Aucun fichier', `Aucun fichier sélectionné pour ${category}.`);
      return;
    }
    Array.from(input.files).forEach(file => this.ajouterFichier(file, type, category));
    input.value = '';
  }

  private ajouterFichier(file: File, type: 'fournisseur' | 'maitreOuvrage', category: string): void {
    if (file.size > 10 * 1024 * 1024) {
      this.openModal('error', 'Fichier trop volumineux', `Le fichier "${file.name}" dépasse la limite de 10 MB.`);
      return;
    }

    const fichier: FichierUpload = {
      nom: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      taille: file.size,
      category: category,
      date: new Date().toISOString().split('T')[0],
      auteur: this.currentUser?.email || 'Inconnu',
      statut: 'En attente',
      commentaire: ''
    };

    if (type === 'maitreOuvrage') {
      (this.fichiersMaitreOuvrage as any)[category].push(fichier);
    } else if (type === 'fournisseur') {
      (this.fichiersFournisseurs as any)[category].push(fichier);
    }
    this.rechercherDocuments();
  }

  supprimerFichier(index: number, type: 'fournisseur' | 'maitreOuvrage', category: string): void {
    if (type === 'maitreOuvrage') {
      (this.fichiersMaitreOuvrage as any)[category].splice(index, 1);
    } else if (type === 'fournisseur') {
      (this.fichiersFournisseurs as any)[category].splice(index, 1);
    }
    this.rechercherDocuments();
  }

  rechercherDocuments(): void {
    const query = this.nomDocumentsRecherche.toLowerCase();
    
    this.documentsFiltresMOA = this.filterDocuments(this.fichiersMaitreOuvrage, query);

    this.documentsFiltresF = this.filterDocuments(this.fichiersFournisseurs, query);
  }

  private filterDocuments(sections: DocumentSections, query: string): FichierUpload[] {
    let allDocuments: FichierUpload[] = [];
    Object.values(sections).forEach(docArray => {
      allDocuments = allDocuments.concat(docArray);
    });
    return allDocuments.filter(doc => doc.nom.toLowerCase().includes(query));
  }

  downloadFile(file: FichierUpload): void {
    if (file.url) {
      this.http.get(file.url, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.nom;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.openModal('success', 'Téléchargement réussi', `Le fichier "${file.nom}" a été téléchargé.`);
        },
        error: () => {
          this.openModal('error', 'Erreur de téléchargement', `Impossible de télécharger "${file.nom}".`);
        }
      });
    } else {
      this.openModal('error', 'Erreur de téléchargement', 'URL de fichier introuvable.');
    }
  }

  previewFile(file: FichierUpload): void {
    if (file.url) {
      window.open(file.url, '_blank');
    } else {
      this.openModal('error', 'Erreur de prévisualisation', 'URL de fichier introuvable.');
    }
  }

  getStatusClass(statut: 'En attente' | 'Validé' | 'Refusé'): string {
    switch (statut) {
      case 'Validé':
        return 'status-valide';
      case 'Refusé':
        return 'status-refuse';
      default:
        return 'status-en-attente';
    }
  }
  
  openModal(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
}