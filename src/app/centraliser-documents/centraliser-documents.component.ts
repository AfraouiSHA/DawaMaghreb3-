// src/app/centraliser-documents/centraliser-documents.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocalDbService } from '../service/local-db.service';
import { SupabaseService } from '../services/supabase.service';
import { User } from '@supabase/supabase-js';
import { RouterModule, Router ,Params,ActivatedRoute} from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

// Interface pour les fichiers mise à jour avec toutes les propriétés
interface FichierUpload {
  nom: string;
  url: string;
  type?: string;
  taille?: number;
  category?: string;
  displayType?: string;
  date?: string;
  auteur?: string;
  commentaire?: string;
  id?: string;
  project_id?: string;
  pv_number?: string | null;
}

// Interface pour les sections de documents
interface DocumentSections {
  avis: FichierUpload[];
  administratifs: FichierUpload[];
  financiers: FichierUpload[];
  techniques: FichierUpload[];
  pv: FichierUpload[];
  autres: FichierUpload[];
}

// Nouvelle interface pour les documents de Supabase
interface SupabaseDocument {
  id?: string;
  project_id: string;
  file_name: string;
  file_url: string;
  category: string;
  stakeholder: string;
  uploaded_at: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  pv_number?: string | null;
}

@Component({
  selector: 'app-centraliser-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, NgIf, RouterModule],
  templateUrl: './centraliser-documents.component.html',
  styleUrls: ['./centraliser-documents.component.css'],
})
export class CentraliserDocumentsComponent implements OnInit, OnDestroy {
  selectedProject: string = '';
   loading: boolean = false;
   
   
  
  logDocumentId(id: string | undefined | null) {
    console.log("ID du document envoyé:", id);
  }
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'success';

  fichiersMaitreOuvrage: DocumentSections = {
    administratifs: [],
    avis: [],
    financiers: [],
    techniques: [],
    autres: [],
    pv: [],
  };
  fichiersFournisseurs: DocumentSections = {
     avis: [],
    administratifs: [],
    financiers: [],
    techniques: [],
    autres: [],
    pv: [],
  };

  currentUser: User | null = null;
   error: string | null = null;
  private destroy$ = new Subject<void>();
private aoId: string | null = null;
  public userEmail: string | null = null;
numeroAO: string | null = null;


  nomDocumentsRecherche: string = '';
  documentsFiltresMOA: FichierUpload[] = [];
  documentsFiltresF: FichierUpload[] = [];

  // Propriétés pour l'ajout de nouveaux documents
  newOtherDocNameF: string = '';
  newOtherDocNameMOA: string = '';
  newPvDocNameMOA: string = ''; // Ajoutez la ligne ici

  private projectId: string | null = null;  

  constructor(
    private localDbService: LocalDbService,
    private http: HttpClient,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
) {}
navigateToPvDownloadPage(): void {
    if (this.projectId) {
      this.router.navigate(['/telechargement-pv'], {
        queryParams: { projectId: this.projectId }
      });
    } else {
      console.error('ID du projet manquant. Impossible de naviguer.');
    }
  }

onAddPvFileChange(event: Event, type: 'maitreOuvrage', newDocName: string): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) {
    this.openModal('warning', 'Aucun fichier', `Aucun fichier sélectionné.`);
    return;
  }
  if (!newDocName?.trim()) {
    this.openModal('warning', 'Nom manquant', `Veuillez d'abord nommer le PV.`);
    input.value = '';
    return;
  }

  const file = input.files[0];
  this.ajouterNouveauFichier(file, 'maitreOuvrage', 'pv', newDocName.trim());
  input.value = '';
}
  



  async savePV(file: File, formValue: any) {
  // 1) upload fichier
  const filePath = `pv/${formValue.projectCode}/${formValue.pv_number}.pdf`; // ex: pv/PROJET-123/PV-01.pdf
  const { data, error } = await this.supabaseService.uploadFile('pv', filePath, file);
  if (error) { console.error(error); return; }

  // (Optionnel) URL publique si bucket public
  const publicUrl = this.supabaseService.getPublicUrl('pv', filePath); // sinon laisse vide

  // 2) insérer les infos en base
  const { data: inserted, error: insertErr } = await this.supabaseService.insertData('pv_documents', {
    file_name: file.name,
    file_path: filePath,
    file_url: publicUrl || null,
    pv_title: formValue.pv_title,
    pv_number: formValue.pv_number,
    pv_date: formValue.pv_date,     // 'YYYY-MM-DD'
    pv_lieu: formValue.pv_lieu,
    pv_redacteur: formValue.pv_redacteur,
    statut: formValue.statut, 
    pv_participants: formValue.pv_participants || [], // ['Chaimae']
    uploaded_by: this.supabaseService.getCurrentUser()?.id || null
  });
  if (insertErr) { console.error(insertErr); return; }

  console.log('PV enregistré !', inserted);
}
  // ➡️ AJOUTEZ CETTE MÉTHODE
async remplirInformation(docId: string | undefined): Promise<void> {
    if (!docId) {
      console.error('ID du document manquant.');
      return;
    }

    // Récupérer les informations existantes du document
    console.log(`[Débogage] Récupération du document avec l'ID : ${docId}`);
    const { data: documentData, error: getError } = await this.supabaseService.getDocument(docId);
    
    if (getError || !documentData) {
      console.error('Erreur lors de la récupération du document :', getError);
      return;
    }
  console.log(`[Débogage] Document récupéré. Catégorie : ${documentData.category}, Numéro de PV actuel : ${documentData.pv_number}`);

    // Vérifier si le document est un PV et s'il n'a pas encore de numéro.
    if (documentData.category === 'pv' && !documentData.pv_number) {
          console.log('[Débogage] C\'est un PV sans numéro. Génération d\'un nouveau numéro...');

      const lastPvNumber = await this.supabaseService.getLastPvNumber();
      let nextNumber = 1;

      if (lastPvNumber) {
        const match = lastPvNumber.match(/PV-(\d+)/);
        if (match && match[1]) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      const formattedNumber = nextNumber.toString().padStart(2, '0');
      const newPvNumber = `PV-${formattedNumber}`;

      // Mettre à jour le document dans la base de données avec le nouveau numéro
      const { error: updateError } = await this.supabaseService.updateDocument(docId, { pv_number: newPvNumber });
    console.log(`[Débogage] Nouveau numéro de PV généré : ${newPvNumber}`);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du numéro de PV :', updateError);
        } else {
      console.log('[Débogage] Numéro de PV sauvegardé avec succès dans la base de données.');
        // On continue la navigation même en cas d'erreur
      }
    }

    // Naviguer vers la page de remplissage des informations
    this.router.navigate(['/remplir-information', docId]);
  }
  
async handleFileUpload(file: File, fileType: string, category: string, stakeholder: string, projectId: string, numeroAO: string) {
     if (!file || !this.numeroAO) {
      console.error('Fichier ou Numéro d\'AO manquant.');
      return;
    }
  if (!file) {
        // Sortir si aucun fichier n'est fourni
        return;
    }
    
    const fileName = file.name;
    const fileExt = fileName.split('.').pop();
    const newDocId = uuidv4();

    // Chemin du fichier dans le bucket Supabase
    const filePath = `${projectId}/${stakeholder}/${category}/${fileName}-${newDocId}.${fileExt}`;

    try {
        // 1. TÉLÉVERSEMENT DU FICHIER
        const { error: uploadError } = await this.supabaseService.uploadFile('documents-projets', filePath, file);
        if (uploadError) {
            throw new Error(`Erreur lors du téléversement : ${uploadError.message}`);
        }

        // 2. OBTENTION DE L'URL PUBLIQUE
        // Correction : La méthode retourne un objet, vous devez accéder à la propriété .data.publicUrl
        const { data: publicUrlData, error: publicUrlError } = this.supabaseService.getPublicUrl('documents-projets', filePath);
        if (publicUrlError) {
            throw new Error(`Erreur lors de la récupération de l'URL publique : ${publicUrlError.message}`);
        }
        const fileUrl = publicUrlData.publicUrl;

        // 3. ENREGISTREMENT DES MÉTADONNÉES DANS LA BASE DE DONNÉES
         const metadata = {
        id: newDocId,
        file_name: fileName,
        file_url: fileUrl,
        project_id: projectId,
        numeroAO: this.numeroAO, // ✅ Utilisation de la variable de classe
        category: category,
      };
        const { error: saveError } = await this.supabaseService.saveDocumentMetadata(metadata);
         if (saveError) throw new Error(`Erreur lors de la sauvegarde des métadonnées : ${saveError.message}`);
        if (saveError) {
            throw new Error(`Erreur lors de la sauvegarde des métadonnées : ${saveError.message}`);
        }

        // 4. REDIRECTION APRÈS SUCCÈS
        this.router.navigate(['/remplir-information', newDocId]);

    } catch (err: any) {
        console.error("Erreur générale :", err.message);
        this.showErrorModal('Erreur de Téléversement', `Une erreur est survenue : ${err.message}`);
    }
}

 // ✅ AJOUTEZ CES DEUX MÉTHODES au composant
  showErrorModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = 'error';
    this.showModal = true;
  }

  // ✅ Suppression de la méthode "remplirInformation" qui n'est plus utile.
  // La redirection est maintenant gérée directement après l'upload.
async ngOnInit(): Promise<void> {
  // 1. Récupère l’ID depuis les **query params**
  const params = this.route.snapshot.queryParams;
  this.projectId = params['projectId'];

  // 2. Si absent → on le crée / on le récupère
  if (!this.projectId) {
    const { data } = await this.supabaseService.getSession();
const user = data?.session?.user;
    if (user) {
      this.projectId = await this.supabaseService.getOrCreateUserProjectId(user.id);
    }
  }

  // 3. Charge les documents
  if (this.projectId) {
    console.log('[Centraliser] projectId prêt :', this.projectId);
    await this.loadDocuments();
    this.rechercherDocuments();
  } else {
    console.error('[Centraliser] Aucun projectId disponible');
    this.openModal('error', 'Erreur de Chargement', 'ID du projet manquant. Veuillez revenir à la page précédente.');
  }
    // ❌ SUPPRIMEZ TOUT LE CODE CI-DESSOUS
    // Initialisation des documents par défaut pour le fournisseur
this.fichiersFournisseurs.avis = [
  { nom: 'Avis d\'appel d\'offre', url: '', category: 'avis' },
];
this.fichiersFournisseurs.administratifs = [
  { nom: 'Déclaration sur l\'honneur', url: '', category: 'administratifs' },
];
this.fichiersFournisseurs.financiers = [
  { nom: 'bordereau des prix (BPU) ', url: '', category: 'financiers' },
];
this.fichiersFournisseurs.techniques = [
  { nom: 'catalogue', url: '', category: 'techniques' },
];
this.fichiersFournisseurs.autres = [
  { nom: 'Autres', url: '', category: 'autres' }
];
// Assurez-vous que la catégorie 'pv' est vide pour le fournisseur
this.fichiersFournisseurs.pv = [];

    // Initialisation des documents par défaut pour le maître d'ouvrage
    this.fichiersMaitreOuvrage.avis = [
      { nom: 'Avis d\'appel d\'offre', url: '', category: 'avis' },
      ];
  
    this.fichiersMaitreOuvrage.techniques = [
      { nom: 'catalogue', url: '', category: 'techniques' },
    ];
    this.fichiersMaitreOuvrage.financiers = [
      { nom: 'bordereau des prix (BPU)	', url: '', category: 'financiers' },
    ];

    this.fichiersMaitreOuvrage.pv = [
      { nom: 'PV de Réunion	', url: '', category: 'PV de Réunion' },
    ];
    
    this.fichiersMaitreOuvrage.autres = [
      { nom: 'Autres', url: '', category: 'autres' }
    ];
    
    // Ajout de "PV de réunion" dans la bonne section
     this.fichiersMaitreOuvrage.pv = [{ nom: 'PV de Réunion', url: '', category: 'pv', date: '', auteur: '' }];

     

    await this.loadDocuments();
    this.rechercherDocuments();
    
    
  }

async uploadPv(file: File) {
  // 1. Récupérer l'utilisateur connecté
  const user = this.supabaseService.getCurrentUser();

  if (!user) {
    console.error("Utilisateur non connecté");
    return;
  }

  try {
    // 2. Upload du fichier
    const filePath = `pv/${Date.now()}_${file.name}`;
    const { data: uploadedFile, error: uploadError } = await this.supabaseService.uploadFile(
      "documents", 
      filePath, 
      file
    );

    if (uploadError) throw uploadError;

    // 3. Insérer les infos dans la table documents
    const { data, error } = await this.supabaseService.insertData("documents", {
      file_name: file.name,
      file_path: filePath,
      uploaded_by: user.id,        // ✅ ici user est bien défini
      shared_with_mo: true
    });

    if (error) throw error;

    console.log("PV sauvegardé avec succès :", data);

  } catch (err) {
    console.error("Erreur lors de l’upload du PV :", err);
  }
}


  async loadDocuments(): Promise<void> {
  // Vérification ajoutée pour s'assurer que projectId n'est pas nul
  if (!this.projectId) {
    console.error('L\'ID du projet est manquant. Impossible de charger les documents.');
    this.openModal('error', 'Erreur de Projet', 'L\'ID du projet est manquant. Veuillez sélectionner un projet valide.');
    return;
  }
  
  // Initialisation des documents
  this.fichiersFournisseurs = this.initializeEmptyDocuments('fournisseur');
  this.fichiersMaitreOuvrage = this.initializeEmptyDocuments('maitreOuvrage');

  // L'appel API est maintenant protégé par la vérification
  const { data, error } = await this.supabaseService.getDataByProjectId(this.projectId); 

  if (error) {
    this.openModal('error', 'Erreur de chargement', 'Impossible de charger les documents existants.');
    return;
  }

  // Le reste de votre logique de fusion des données
  if (data) {
    (data as SupabaseDocument[]).forEach(doc => {
      let targetSections = doc.stakeholder === 'fournisseur' ? this.fichiersFournisseurs : this.fichiersMaitreOuvrage;
      const categoryList = targetSections[doc.category as keyof DocumentSections];
      
      const fileUpload: FichierUpload = {
        id: doc.id,
        nom: doc.file_name,
        url: doc.file_url,
        category: doc.category,
        date: doc.uploaded_at,
        auteur: doc.uploaded_by,
      };

      const indexById = categoryList.findIndex(d => d.id === doc.id);

      if (indexById !== -1) {
        categoryList[indexById] = fileUpload;
      } else {
        const indexByUrl = categoryList.findIndex(d => !d.url);
        if (indexByUrl !== -1) {
          Object.assign(categoryList[indexByUrl], fileUpload);
        } else {
          categoryList.push(fileUpload);
        }
      }
    });
  }
  this.rechercherDocuments();
}

  onFileChange(event: Event, type: 'fournisseur' | 'maitreOuvrage', category: string, documentIndex: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.openModal('warning', 'Aucun fichier', `Aucun fichier sélectionné.`);
      return;
    }
    
    const file = input.files[0];
    this.ajouterOuModifierFichier(file, type, category, documentIndex);
    input.value = '';
  }
  
 async ajouterOuModifierFichier(file: File, type: 'fournisseur' | 'maitreOuvrage', category: string, documentIndex: number): Promise<void> {
  
    const { data: { session }, error: sessionError } = await this.supabaseService.getSession();

    
    // ✅ Utilisation de la session pour la vérification
    if (sessionError || !session || !session.user?.id) {
      this.openModal('error', 'Erreur d\'authentification', `Vous devez être connecté pour téléverser un fichier.`);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      this.openModal('error', 'Fichier trop volumineux', `Le fichier "${file.name}" dépasse la limite de 10 MB.`);
      return;
    }
    
    
    const currentUserName = this.supabaseService.getCurrentUserName();

    // ✅ CORRECTION : Assainir le nom de fichier avant de le téléverser
    let sanitizedFileName = file.name
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .normalize("NFD") // Normalise les caractères accentués
      .replace(/[\u0300-\u036f]/g, ""); // Supprime les accents
      
    const uniqueFileName = `${sanitizedFileName}-${Date.now()}.${file.name.split('.').pop()}`;
    const bucketName = 'documents-projets';
    // ✅ CORRECTION : le projectId est bien présent ici
    const filePath = `${this.projectId}/${type}/${category}/${uniqueFileName}`;

    const { data: uploadData, error: uploadError } = await this.supabaseService.uploadFile(bucketName, filePath, file);

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        this.openModal('error', 'Erreur d\'upload', `Impossible de téléverser le fichier "${file.name}".`);
        return;
    }

    const { data: publicUrlData, error: urlError } = this.supabaseService.getPublicUrl(bucketName, filePath);
     if (urlError || !publicUrlData) {
      console.error('Erreur URL publique:', urlError);
      this.openModal('error', 'Erreur d\'URL', `Impossible de générer l'URL publique pour "${file.name}".`);
      return;
    }
        const fileUrl = publicUrlData.publicUrl;


    if (fileUrl) {
        let docName = (type === 'maitreOuvrage' && category === 'pv' && this.fichiersMaitreOuvrage.pv.length > documentIndex) 
                      ? this.fichiersMaitreOuvrage.pv[documentIndex].nom 
                      : file.name;
        const originalFileName = file.name;
        
        const metadata: SupabaseDocument = {
          project_id: this.projectId!,
          file_name: originalFileName,
          file_url: fileUrl,
          category: category,
          stakeholder: type,
          uploaded_at: new Date().toISOString(),
          uploaded_by: session.user.id, // Utiliser l'ID de session directement
        };
        const { data: savedDoc, error: saveError } = await this.supabaseService.saveDocumentMetadata(metadata);
console.log('Réponse de Supabase après sauvegarde:', savedDoc);

        if (!saveError) {
           // Si une erreur existe, on l'affiche et on ouvre le modal
          console.error('Erreur sauvegarde metadata:', saveError);
            this.openModal('error', 'Erreur de sauvegarde', `Le fichier a été téléversé mais ses informations n'ont pas pu être sauvegardées.`);
            } else {
              // Sauvegarde réussie
  this.openModal('success', 'Upload réussi', `Le fichier "${metadata.file_name}" a été téléversé et sauvegardé.`);
            let targetSection: DocumentSections = type === 'maitreOuvrage' ? this.fichiersMaitreOuvrage : this.fichiersFournisseurs;
  const categoryList = (targetSection as any)[category];

            if (categoryList && documentIndex >= 0 && documentIndex < categoryList.length) {
               const docToUpdate = categoryList[documentIndex];
      docToUpdate.id = savedDoc?.[0]?.id;
      docToUpdate.url = fileUrl;
      docToUpdate.date = new Date().toISOString().split('T')[0];
      docToUpdate.auteur = currentUserName;
      const originalName = docToUpdate.nom; // Sauvegardez le nom par défaut
            }
          }

    await this.loadDocuments();
    this.rechercherDocuments();
  
  }
}
  
  async supprimerFichier(documentIndex: number, type: 'fournisseur' | 'maitreOuvrage', category: string): Promise<void> {
    let targetSection: DocumentSections = type === 'maitreOuvrage' ? this.fichiersMaitreOuvrage : this.fichiersFournisseurs;
    const documentToUpdate = (targetSection as any)[category][documentIndex];

    if (documentToUpdate && documentToUpdate.url) {
        if (!documentToUpdate.id) {
            this.openModal('error', 'Erreur', `Impossible de trouver l'ID du document pour la suppression.`);
            return;
        }

        if (!confirm(`Êtes-vous sûr de vouloir supprimer le document "${documentToUpdate.nom}" ?`)) {
            return;
        }

        const { error: dbError } = await this.supabaseService.deleteDocumentMetadataById(documentToUpdate.id);
        if (dbError) {
            this.openModal('error', 'Erreur de suppression', `Impossible de supprimer l'entrée de la base de données.`);
            return;
        }

        const bucketName = 'documents-projets';
        const filePath = documentToUpdate.url.split(`${bucketName}/`).pop();

        if (filePath) {
            const { error: storageError } = await this.supabaseService.deleteFile(bucketName, filePath);
            if (storageError) {
                this.openModal('warning', 'Avertissement de suppression', `Le document a été supprimé de la base de données mais pas du stockage.`);
            }
        }

        documentToUpdate.url = '';
        documentToUpdate.date = '';
        documentToUpdate.auteur = '';
        documentToUpdate.id = undefined;

        this.openModal('success', 'Suppression réussie', `Le fichier "${documentToUpdate.nom}" a été supprimé.`);
        await this.loadDocuments();
    }
  }

  rechercherDocuments(): void {
    if (!this.projectId) {
    console.warn('[Centraliser] rechercherDocuments annulée → projectId null');
    return;
  }
    const query = this.nomDocumentsRecherche.toLowerCase();
    console.log('Documents filtrés MOA:', this.documentsFiltresMOA);
console.log('Documents PV:', this.fichiersMaitreOuvrage.pv);
    
    this.documentsFiltresMOA = this.filterDocuments(this.fichiersMaitreOuvrage, query);
    this.documentsFiltresF = this.filterDocuments(this.fichiersFournisseurs, query);
    
  }
  

  private filterDocuments(sections: DocumentSections, query: string): FichierUpload[] {
    let allDocuments: FichierUpload[] = [];
    const categoriesMap = {
      administratifs: 'Dossier Administratif',
      techniques: 'Dossier Technique',
      financiers: 'Dossier Financier',
      autres: 'Autres Documents',
      pv: 'PV de Réunion',
    };

    for (const key in sections) {
      if (Object.prototype.hasOwnProperty.call(sections, key)) {
        const categoryName = categoriesMap[key as keyof typeof categoriesMap];
        const docs = sections[key as keyof typeof sections];
        docs.forEach(doc => {
          const docWithDisplayType = { ...doc, displayType: categoryName, category: key };
          allDocuments.push(docWithDisplayType);
        });
      }
    }
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
      this.openModal('warning', 'Erreur de téléchargement', `Aucun fichier n'a été uploadé pour "${file.nom}".`);
    }
  }

  previewFile(file: FichierUpload): void {
    if (file.url) {
      window.open(file.url, '_blank');
    } else {
      this.openModal('warning', 'Erreur de prévisualisation', `Aucun fichier n'a été uploadé pour "${file.nom}".`);
    }
  }

  openModal(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  onUploadClick(id: string): void {
    document.getElementById(id)?.click();
  }

  closeModal(): void {
    this.showModal = false;
  }
  

  // Méthodes pour les "Autres Documents"
  onAddOtherFileChange(event: Event, type: 'fournisseur' | 'maitreOuvrage', newDocName: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.openModal('warning', 'Aucun fichier', `Aucun fichier sélectionné.`);
      return;
    }
    if (!newDocName || newDocName.trim() === '') {
      this.openModal('warning', 'Nom manquant', `Veuillez d'abord nommer le document.`);
      input.value = '';
      return;
    }
    
    const file = input.files[0];
    
    this.ajouterNouveauFichier(file, type, 'autres', newDocName);

    input.value = '';
  }


async saveMetadataToSupabase(metadata: any, file: File, stakeholder: 'fournisseur' | 'maitreOuvrage') {
  try {
    console.log("Sauvegarde des métadonnées pour le projet :", this.projectId);
    console.log("Métadonnées à sauvegarder :", metadata);

    // ... votre code de sauvegarde existant
  } catch (error) {
    console.error('Erreur sauvegarde metadata:', error);
  }
}
async ajouterNouveauFichier(file: File, type: 'fournisseur' | 'maitreOuvrage', category: string, docName: string): Promise<void> {
  if (!this.projectId) {
    console.error('Erreur: L\'ID du projet est manquant.');
    this.openModal('error', 'Erreur', 'ID du projet manquant. Impossible de téléverser.');
    return;
  }
  
  const { data: { session }, error: sessionError } = await this.supabaseService.getSession();
  
  if (sessionError || !session) {
    this.openModal('error', 'Erreur d\'authentification', `Vous devez être connecté pour téléverser un fichier.`);
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
      this.openModal('error', 'Fichier trop volumineux', `Le fichier "${file.name}" dépasse la limite de 10 MB.`);
      return;
  }
  
  let sanitizedDocName = docName
      .replace(/\s+/g, '-')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
      
  const uniqueFileName = `${sanitizedDocName}-${Date.now()}.${file.name.split('.').pop()}`;
  const bucketName = 'documents-projets';
  
  const filePath = `${this.projectId}/${type}/${category}/${uniqueFileName}`;

  const { data: uploadData, error: uploadError } = await this.supabaseService.uploadFile(bucketName, filePath, file);

  if (uploadError) {
      this.openModal('error', 'Erreur d\'upload', `Impossible de téléverser le fichier "${file.name}".`);
      return;
  }

  const { data: publicUrlData, error: urlError } = await this.supabaseService.getPublicUrl(bucketName, filePath);
  const fileUrl = publicUrlData.publicUrl;

  if (fileUrl && !urlError) {
      let pvNumber: string | null = null;
      
      if (category === 'pv') {
          try {
              pvNumber = await this.supabaseService.getNextPvNumber();
              // Optionnel: Mettez le nom du document au numéro de PV
              // docName = pvNumber; 
          } catch (e) {
              this.openModal('error', 'Erreur de numérotation', 'Impossible de générer un numéro de PV. Le document sera sauvegardé sans numéro.');
          }
      }

      const metadata: SupabaseDocument = {
          project_id: this.projectId!,
          file_name: docName,
          file_url: fileUrl,
          category: category,
          stakeholder: type,
          uploaded_by: session.user.id || '00000000-0000-0000-0000-000000000000',
          uploaded_by_name: this.supabaseService.getCurrentUserName(),
          uploaded_at: new Date().toISOString(),
          pv_number: pvNumber,
          
          
      };
      
      const { data: savedDoc, error: saveError } = await this.supabaseService.saveDocumentMetadata(metadata);

      if (!saveError) {
          this.openModal('success', 'Upload réussi', `Le fichier "${docName}" a été téléversé et sauvegardé.`);
          
          const newFichierUpload: FichierUpload = {
              id: savedDoc?.[0]?.id,
              nom: docName,
              url: fileUrl,
              category: category,
              date: new Date().toISOString().split('T')[0],
              auteur: this.supabaseService.getCurrentUserName(),
              pv_number: pvNumber,
          };
          
          let targetSection: DocumentSections = type === 'maitreOuvrage' ? this.fichiersMaitreOuvrage : this.fichiersFournisseurs;
          (targetSection as any)[category].push(newFichierUpload);
          console.log('Document ajouté au tableau:', newFichierUpload);
          
      } else {
          this.openModal('error', 'Erreur de sauvegarde', `Le fichier a été téléversé mais ses informations n'ont pas pu être sauvegardées.`);
      }
      
      await this.loadDocuments();
      this.rechercherDocuments();
  } else {
      this.openModal('error', 'Erreur d\'upload', `Impossible de téléverser le fichier "${file.name}".`);
  }
}

private isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}


  private initializeEmptyDocuments(forStakeholder: 'fournisseur' | 'maitreOuvrage'): DocumentSections {
  const documentsFournisseurs = [
      { nom: 'Avis d\'appel d\'offre', category: 'avis' },
      { nom: 'Déclaration sur l\'honneur', category: 'administratifs' },
      { nom: 'Catalogue', category: 'techniques' },
      { nom: ' bordereau des prix ', category: 'financiers' },
      { nom: 'Autres', category: 'autres' }
  ];

  const documentsMaitreOuvrage = [
      ...documentsFournisseurs,
     
      { nom: 'Déclaration sur l\'honneur', category: 'administratifs' },
     
      
      { nom: 'PV de réunion', category: 'pv' }
  ];

  const sections: DocumentSections = { avis: [], administratifs: [], financiers: [], techniques: [], autres: [], pv: [] };

  const documentsToUse = forStakeholder === 'maitreOuvrage' ? documentsMaitreOuvrage : documentsFournisseurs;

  documentsToUse.forEach(doc => {
      const fileUpload: FichierUpload = { ...doc, url: '', date: '', auteur: '' };
      (sections as any)[doc.category].push(fileUpload);
  });

  return sections;
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
}