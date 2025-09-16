// src/app/pages/mieux-offrant/mieux-offrant.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf, NgFor, CurrencyPipe, PercentPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, lastValueFrom } from 'rxjs';
import { Router,ActivatedRoute } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';

// Standard library imports installed via npm
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

interface AppelOffresItem {
   id_appel: number;
  refAO: string;
}





// Interface for Tender Data
interface AppelOffresData {
  id: string;
  refAO: string;
  objetAO: string;
  budgetPrevisionnel: number;
  dateLimite: string; // ISO 8601 format
  statut: string;
  responsable: string;
  prochaineEtape?: string;
}

// Interface for a Supplier
interface Fournisseur {
  nom: string;
  idFournisseur: string;
  logoUrl: string;
}

// Interface for individual documents with name and URL
interface DocumentItem {
  name: string;
  url: string; // This URL is a public Supabase Storage URL
}


// NEW INTERFACE: Represents a single item/row from the devis_data array in Supabase
interface DevisItem {
  numero?: number;
  designation?: string;
  unite?: string;
  quantite?: number;
  pu_ht?: number; // Prix Unitaire Hors Taxe
  pt_ht?: number; // Prix Total Hors Taxe
  // Add any other fields that might be present in your devis_data objects
  [key: string]: any; // Allows for flexible properties if the structure varies
  
}

// Interface for an Offer (submission)
interface Offer {
  id: string; // ID of the submission in Supabase
  refAO: string; // Reference of the AO
  objetAO: string; // Object of the AO
  fournisseur: Fournisseur;
  montantTotal: number; // This maps to total_ttc from Supabase
  totalHT: number; // New property for total_ht from Supabase
  tvaAmount: number; // New property for tva_amount from Supabase
  scoreTechnique: number;
  conformite: 'Conforme' | 'Non Conforme';
  motifNonConformite?: string;
  documents: {
    technical: DocumentItem[];
    administrative: DocumentItem[];
  };
  evaluationTechnique?: EvaluationDetails;
  evaluationFinanciere?: EvaluationDetails;
  delaiExecution?: number;
  excelFileName?: string; // This property is crucial for loading Excel data
  // This will now store the raw array from Supabase
  devisDataFromDB?: DevisItem[]; // Raw data from the 'devis_data' column
  devis_data?: any[] | string;
  
  // This property will be constructed in selectOffer for HTML display
  excelDevisDataForDisplay?: ExcelDevisData;
}

// Interface for evaluation details
interface EvaluationDetails {
  criteria?: Criterion[];
  
  averageScore?: number;
  comments: string;
}

// Interface for a criterion
interface Criterion {
  name: string;
  weight: number;
  score: number;
}

// Interface for a message
interface Message {
  fournisseurId: string;
  messageContent: string;
  timestamp: string;
}

// Interface for a decision history item
interface DecisionHistoryItem {
  date: Date;
  status: string;
  comment: string;
}

// Interface for Excel quote data (structured for display in HTML)
interface ExcelDevisData {
  gridData: any[][]; // The array of arrays (raw sheet structure including headers)
  metadata: {
    title?: string;
    totalHTValue?: number;
    tvaValue?: number;
    totalTTCValue?: number;
    totalHTLabel?: string;
    tvaLabel?: string;
    totalTTCLabel?: string;
  };
}


@Component({
  selector: 'app-mieux-offrant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    NgFor,
    CurrencyPipe,
    PercentPipe,
    DatePipe
  ],
  templateUrl: './mieux-offrant.component.html',
  styleUrls: ['./mieux-offrant.component.css']
})
export class MieuxOffrantComponent implements OnInit {

  private BASE_BACKEND_URL = 'http://localhost:3000';
  private SUPABASE_PROJECT_REF = 'kfzlkfupyrokfimekkee'; // Ensure this reference is correct
  private SUPABASE_BASE_STORAGE_URL = `https://${this.SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public`;
  

  // Initial data for the tender

  aoData: AppelOffresData = {
    id: 'AO-007-2025',
    refAO: 'AO-TECH-2025-007',
    objetAO: 'Acquisition et mise en place d\'une solution ERP et CRM intégrée.',
    budgetPrevisionnel: 4800000,
    dateLimite: '2025-07-31',
    statut: 'En cours d\'évaluation',
    responsable: '',
    prochaineEtape: 'Validation des rapports techniques finaux par le comité.'
  };
  originalAoData: AppelOffresData | undefined; // To store original AO data for edit cancellation
  isEditMode: boolean = false;
  statutOptions = [
    { value: 'En cours d\'évaluation', label: 'En cours d\'évaluation' },
    { value: 'En attente de décision', label: 'En attente de décision' },
    { value: 'Attribué', label: 'Attribué' },
    { value: 'Annulé', label: 'Annulé' },
    { value: 'Clos', label: 'Clos' }
  ];
  loadingAoData: boolean = false; // Loading indicator for AO data
  aoFeedbackMessage: string = ''; // Feedback message for AO data operations
  isAoError: boolean = false; // Error state for AO data operations

  rowData: Offer[] = []; // Stores all retrieved offers
  devisData: DevisItem[] = [];
devis_data?: any[] | string;
uniqueTenderOffers: string[] = [];
selectedTenderOffer: string | null = null;
 bids: any[] = [];
 selectedBid: any = null;
 selectedTenderOfferId: number | null = null;
 selectedSubmission: any = null;
 selecterSoumission(bid: any): void {
  // Stocke la soumission sélectionnée pour l'affichage
  this.selectedSubmission = bid;

  // Ici, vous pouvez traiter les données du devis si nécessaire
  // Par exemple, extraire les lignes du devis pour les afficher
  // this.devisData = JSON.parse(bid.devis_data);
}

voirDetails(bid: any): void {
  this.selectedBid = bid;
  // Ici, vous pouvez déclencher l'affichage des sections
  // Informations sur l'Appel d'Offres
  this.afficherInformationsAO(bid);

  // Tableau Comparatif des Offres (si nécessaire)
  this.afficherTableauComparatif(bid);

  // Analyse des Évaluations (si nécessaire)
  this.afficherAnalyseEvaluations(bid);
}

afficherInformationsAO(bid: any): void {
  // Logique pour afficher les informations de l'AO
  // Par exemple, vous pouvez lier les données à des variables
  // dans le template HTML
  // this.refAO = bid.numeroAO;
  // this.objetAO = bid.objet;
  // this.dateLimiteAO = bid.dateLimite;
}

afficherTableauComparatif(bid: any): void {
  // Logique pour remplir le tableau comparatif
  // Vous pouvez utiliser this.bids pour avoir toutes les soumissions
  // de l'AO en cours et les comparer ici
}

afficherAnalyseEvaluations(bid: any): void {
  // Logique pour remplir l'analyse des évaluations
}



  bestOfferAmount: number = 0; // The lowest offer amount
  sortedOffersByPrice: Offer[] = []; // Offers sorted by price

  selectedTab: 'technical' | 'financial' = 'technical'; // Current active tab (technical/financial)
  selectedOffer: Offer | null = null; // Details of the currently selected offer

  decisionComment: string = ''; // Comment for the decision
  decisionHistory: DecisionHistoryItem[] = []; // Decision history

  searchTerm: string = ''; // Search term for messages
  loadingMessages: boolean = false; // Loading indicator for messages
  messagesHistory: Message[] = []; // Stores retrieved messages
  originalMessagesHistory: Message[] = [ // Initial dummy message data
    { fournisseurId: 'F001', messageContent: 'Demande de clarification sur les délais de livraison du matériel.', timestamp: '2025-06-12T10:00:00Z' },
    { fournisseurId: 'F002', messageContent: 'Questions concernant les spécifications techniques de l\'intégration.', timestamp: '2025-06-13T14:30:00Z' },
    { fournisseurId: 'F001', messageContent: 'Réponse à la demande de clarification: délais confirmés sous 3 semaines.', timestamp: '2025-06-14T09:15:00Z' },
    { fournisseurId: 'F003', messageContent: 'Demande d\'extension de la date limite de soumission.', timestamp: '2025-06-14T11:00:00Z' },
  ];
  errorMessage: string = ''; // Error message for the messages section

  isDocumentLoading: boolean = false; // Loading indicator for opening documents
  currentLoadingDocumentOfferId: string | null = null;
  currentLoadingDocumentType: 'technical' | 'administrative' | null = null;
  documentLoadingError: string | null = null;

  // MODIFIED: This property is now for display, not direct DB mapping
  excelDevisDataForDisplay: ExcelDevisData | null = null; // Stores parsed Excel quote data for display
  totalHTDevis: number = 0; // Pre-tax total of the Excel quote (now directly from DB column)
  tvaDevis: number = 0; // VAT of the Excel quote (now directly from DB column)
  totalTTCDevis: number = 0; // All-tax total of the Excel quote (now directly from DB column)
  loadingDevisData: boolean = false; // Loading indicator for Excel quote data
  devisLoadError: string = ''; // Error message for Excel quote loading

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router, private supabaseService: SupabaseService,private route: ActivatedRoute,) {
    this.originalAoData = { ...this.aoData };
  }

  /**
   * Initializes the component:
   * - Initializes the Supabase client.
   * - Fetches offers from Supabase.
   * - Loads message and decision history.
   * - Calculates offer statistics.
   * - Selects the first offer if available.
   */
  async ngOnInit(): Promise<void> {
     console.log("ngOnInit() - Démarrage du chargement des appels d'offres uniques.");
    await this.loadUniqueTenderOffers();

    console.log('[DEBUG MIEUX-OFFRANT] ngOnInit called.');

    await this.fetchOffersFromSupabase(); // Fetch offers

    this.loadMessagesHistory();
    this.loadDecisionHistory();
    this.calculateOfferStatistics();

    // Select the first offer if available after fetching
    if (this.rowData.length > 0) {
      console.log('[DEBUG MIEUX-OFFRANT] Calling selectOffer with the first row.');
      this.selectOffer(this.rowData[0]);
    } else {
      console.log('[DEBUG MIEUX-OFFRANT] No offers in rowData, selectOffer not called.');
    }
  }

async loadUniqueTenderOffers(): Promise<void> {
    const { data, error } = await this.supabaseService.getUniqueTenderOffers();

    if (error) {
      this.errorMessage = 'Erreur lors du chargement des appels d\'offres.';
      console.error(error);
      return;
    }

    if (data && data.length > 0) {
      console.log("Données reçues dans le composant :", data);
      // Mappez le tableau d'objets en un tableau de chaînes de caractères
      this.uniqueTenderOffers = data.map((item: any) => item.numeroAO);

      console.log("Liste finale des AO uniques :", this.uniqueTenderOffers);

      this.selectedTenderOffer = this.uniqueTenderOffers[0];
      await this.onTenderOfferSelected();
    } else {
      console.log("Aucune donnée trouvée pour les appels d'offres uniques.");
      this.errorMessage = "Aucun appel d'offres n'a encore reçu de soumission.";
    }
  }

async onTenderOfferSelected(): Promise<void> {
    if (this.selectedTenderOffer) {
      const { data, error } = await this.supabaseService.getBidsByTenderRef(this.selectedTenderOffer);
      if (error) {
        this.errorMessage = 'Erreur lors du chargement des soumissions.';
        console.error(error);
        this.bids = [];
        return;
      }
      this.bids = data;
    }
  }
 
  vendorRetenu: string = '';
isRetenu: boolean = false;
vendorNonRetenu: string = '';
isNonRetenu: boolean = false;










  async loadOffers(aoId: string): Promise<void> {
  const { data: soumissionsData, error } = await this.supabaseService.getClient().from('soumissions').select('*').eq('ao_id', aoId);

  };
  /**
   * Calculates the pre-tax total (HT), VAT, and all-tax total (TTC) from the Excel grid data.
   * This function is now primarily for populating the gridData for display,
   * not for calculating the main totals if they are available from Supabase columns.
   */

    async fetchTenderDetails(): Promise<void> {
  // ✅ On s'assure qu'une offre est sélectionnée et qu'elle a une référence d'AO
  if (!this.selectedOffer || !this.selectedOffer.refAO) {
    this.aoFeedbackMessage = 'Aucune référence d\'AO disponible pour cette offre.';
    this.isAoError = true;
    this.cdr.detectChanges();
    return;
  }

  this.loadingAoData = true;
  this.aoFeedbackMessage = 'Chargement des informations de l\'AO...';
  this.isAoError = false;

  try {
    // ⚠️ Supposons que votre table d'AO s'appelle 'appel_offres' et a une colonne 'refAO'
    const { data, error } = await this.supabaseService.getAppelOffresByRef(this.selectedOffer.refAO);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      this.aoData = data[0]; // On prend le premier résultat
      this.aoFeedbackMessage = 'Informations de l\'AO chargées avec succès.';
      this.isAoError = false;
    } else {
      this.aoFeedbackMessage = 'Aucune information d\'AO trouvée pour cette référence.';
      this.isAoError = true;
    }
  } catch (err: any) {
    this.aoFeedbackMessage = `Erreur lors du chargement des informations de l'AO: ${err.message}`;
    this.isAoError = true;
    
    console.error('Erreur détaillée:', err);
  } finally {
    this.loadingAoData = false;
    this.cdr.detectChanges();
  }
}



  async fetchOffersFromSupabase(): Promise<void> {
    this.loadingAoData = true;
    this.aoFeedbackMessage = 'Loading offers from Supabase...';
    this.isAoError = false;

    try {
      const { data, error } = await this.supabaseService.getFournisseurs();

      if (error) {
        throw error;
      }
      console.log('Offers loaded from Supabase:', this.rowData);

      if (data && data.length > 0) { // Explicitly check if the data array is not empty
              console.log('Données brutes reçues de Supabase avant transformation:', data);
        this.rowData = data.map((item: any): Offer => {
          // *** MODIFICATION ICI : Parser chaque chaîne JSON d'URL ***
                  console.log('Item brut en cours de traitement:', item);

          const parsedFileUrls = (item.fichiers_joints || []).map((jsonUrlString: string) => {
            try {
              // JSON.parse convertira "\"https://url.pdf\"" en "https://url.pdf"
              return JSON.parse(jsonUrlString);
            } catch (e) {
              console.warn(`Could not parse URL string: ${jsonUrlString}`, e);
              return jsonUrlString; // Retourne l'original si le parsing échoue
            }
          });

          // Ensuite, passez les URLs correctement parsées à categorizeSupabaseFiles
          const documents = this.categorizeSupabaseFiles(parsedFileUrls);
          // Simulate conformity and technical score for demonstration purposes
          const isConforme = Math.random() > 0.1;
          const conformityStatus = isConforme ? 'Conforme' : 'Non Conforme';
          const nonConformityReason = isConforme ? undefined : 'Missing or incomplete documents';
          const technicalScore = Math.floor(Math.random() * (95 - 60 + 1)) + 60

          return {
  id: item.id_fournisseur,
  refAO: item.numeroAO,
  objetAO: item.objet,
  fournisseur: {
    nom: item.nom_entreprise,
    idFournisseur: item.id_fournisseur,
    logoUrl: `https://placehold.co/50x50/aabbcc/ffffff?text=${item.nom_entreprise.substring(0, 3).toUpperCase()}`
  },
  montantTotal: item.total_ttc || 0,
  totalHT: item.total_ht || 0,
  tvaAmount: item.tva_amount || 0,
  scoreTechnique: technicalScore,
  conformite: conformityStatus,
  motifNonConformite: nonConformityReason,
  delaiExecution: item.delai_execution || null,
  evaluationTechnique: { comments: 'Technical evaluation not specified.' },
  evaluationFinanciere: { comments: 'Financial evaluation not specified.' },
  excelFileName: item.excel_file_name || null,
  devis_data: item.devis_data || null, // N'oubliez pas la virgule après cette ligne
  documents: {
    // Les deux sous-propriétés doivent être séparées par une virgule
    technical: item.documents_techniques || [],
    administrative: item.documents_administratifs || []
  }
};
        });
        console.log('Offers loaded from Supabase:', this.rowData);
        this.aoFeedbackMessage = 'Offers loaded successfully!';
      } else {
        this.rowData = [];
        this.aoFeedbackMessage = 'No offers found in the database for this tender.';
        this.isAoError = false;
        console.warn('No offer data returned by Supabase.');
      }
    } catch (err: any) {
      this.aoFeedbackMessage = `Error loading offers: ${err.message || 'Unknown error'}`;
      this.isAoError = true;
      this.rowData = [];
      console.error('Detailed error loading offers:', err);
    } finally {
      this.loadingAoData = false;
      this.cdr.detectChanges(); // Trigger change detection
    }
  }



  /**
   * Categorizes Supabase file URLs into technical and administrative documents.
   * @param fileUrls An array of Supabase file URLs.
   * @returns An object containing categorized technical and administrative documents.
   */
  private categorizeSupabaseFiles(fileUrls: string[]): { technical: DocumentItem[], administrative: DocumentItem[] } {
    const technical: DocumentItem[] = [];
    const administrative: DocumentItem[] = [];

    fileUrls.forEach(url => {
      const lowerCaseUrl = url.toLowerCase();
      const fileName = this.getFileNameFromUrl(url);

      if (lowerCaseUrl.includes('/registrecommerce/') || lowerCaseUrl.includes('/attestationfiscale/') || lowerCaseUrl.includes('/attestationcnss/') || lowerCaseUrl.includes('administratif')) {
        administrative.push({ name: fileName, url: url });
      } else if (lowerCaseUrl.includes('/refprojets/') || lowerCaseUrl.includes('/plans/') || lowerCaseUrl.includes('/cvtech/') || lowerCaseUrl.includes('technique')) {
        technical.push({ name: fileName, url: url });
      } else {
        // Default to technical if category cannot be determined
        technical.push({ name: fileName, url: url });
      }
    });
    return { technical, administrative };
  }

  /**
   * Extracts the file name from a given URL.
   * @param url The file URL.
   * @returns The extracted file name.
   */
  getFileNameFromUrl(url: string): string {
    try {
      const urlParts = url.split('/');
      return decodeURIComponent(urlParts[urlParts.length - 1].split('?')[0]);
    } catch (e) {
      return url; // Return original URL if parsing fails
    }
  }

  /**
   * Calculates offer statistics, such as the best offer amount
   * and offers sorted by price.
   */
  private calculateOfferStatistics(): void {
    if (this.rowData.length > 0) {
      this.bestOfferAmount = this.rowData.reduce((min, offer) => Math.min(min, offer.montantTotal), this.rowData[0].montantTotal);
      this.sortedOffersByPrice = [...this.rowData].sort((a, b) => a.montantTotal - b.montantTotal);
    } else {
      this.bestOfferAmount = 0;
      this.sortedOffersByPrice = [];
    }
  }

  /**
   * Toggles edit mode for AO data.
   * Saves a copy of original data when entering edit mode.
   * Restores original data if edit mode is cancelled without saving.
   */
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.originalAoData = { ...this.aoData };
      this.aoFeedbackMessage = '';
      this.isAoError = false;
    } else {
      // If exiting edit mode without saving, restore original data
      if (this.originalAoData) {
        // Ensure date format is correct for input type="date"
        if (this.originalAoData.dateLimite) {
          this.originalAoData.dateLimite = new Date(this.originalAoData.dateLimite).toISOString().split('T')[0];
        }
        Object.assign(this.aoData, this.originalAoData);
      }
    }
  }

  /**
   * Cancels editing of AO details and reverts to original data.
   */
  cancelEdit(): void {
    if (this.originalAoData) {
      this.aoData = { ...this.originalAoData };
      // Ensure date format is correct for input type="date"
      if (this.aoData.dateLimite) {
        this.aoData.dateLimite = new Date(this.aoData.dateLimite).toISOString().split('T')[0];
      }
    }
    this.isEditMode = false;
    this.aoFeedbackMessage = 'Changes cancelled.';
    this.isAoError = false;
  }

  /**
   * Saves AO details to the backend.
   * @param form The NgForm instance to check validity.
   */
  saveAoDetails(form: NgForm): void {
    if (form && form.invalid) {
      this.aoFeedbackMessage = 'Please correct the errors in the form.';
      this.isAoError = true;
      // Mark all controls as touched to display validation errors
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.loadingAoData = true;
    this.aoFeedbackMessage = 'Saving AO information...';
    this.isAoError = false;

    this.http.post(`${this.BASE_BACKEND_URL}/api/ao-details`, this.aoData).subscribe({
      next: (response) => {
        console.log('AO details saved:', response);
        this.aoFeedbackMessage = 'AO information saved successfully!';
        this.isAoError = false;
        this.isEditMode = false; // Exit edit mode on success
        this.originalAoData = { ...this.aoData }; // Update original data
        this.loadingAoData = false;
      },
      error: (error) => {
        console.error('Error saving AO details:', error);
        this.aoFeedbackMessage = `Error saving: ${error.message || 'Unknown error'}`;
        this.isAoError = true;
        this.loadingAoData = false;
      }
    });
  }

  /**
   * Opens and merges documents (PDF) for a selected offer.
   * Downloads the merged PDF.
   * @param offer The selected offer.
   * @param docType The type of documents to open ('technical' or 'administrative').
   */
    async openDocument(offer: any, docType: 'administrative' | 'technical'): Promise<void> {
    console.log(`[LOG] Début du processus de téléchargement. Offre ID: ${offer?.id}, Type de document: ${docType}`);
    this.documentLoadingError = null; // Correction de l'erreur de typage
    this.isDocumentLoading = true;
    this.currentLoadingDocumentOfferId = offer.id;
    this.currentLoadingDocumentType = docType;

    if (!offer || !offer.documents) {
      this.documentLoadingError = 'L\'offre sélectionnée n\'a pas de documents. Veuillez vérifier les données.';
      this.isDocumentLoading = false;
      return;
    }

    const documentsToLoad = offer.documents[docType];
      console.log(`[DEBUG] Documents ${docType} récupérés :`, documentsToLoad);

    if (!documentsToLoad || documentsToLoad.length === 0) {
      this.documentLoadingError = `Aucun document ${docType === 'technical' ? 'technique' : 'administratif'} disponible pour cette offre.`;
      this.isDocumentLoading = false;
      return;
    }
     
    try {
      // Utilisez await pour attendre que la promesse soit résolue
      const pdfDoc = await PDFDocument.create();

      for (const doc of documentsToLoad) {
        if (doc.url) {
          console.log(`[LOG] Téléchargement du document depuis : ${doc.url}`);
          const response = await fetch(doc.url);
          const pdfBytes = await response.arrayBuffer();
          const loadedPdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await pdfDoc.copyPages(loadedPdf, loadedPdf.getPageIndices());
          copiedPages.forEach(page => pdfDoc.addPage(page));
        }
      }


      const mergedPdfBytes = await pdfDoc.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const filename = `${offer.fournisseur.nom}_${docType}_merged.pdf`;
      saveAs(blob, filename);
      
      console.log(`[SUCCÈS] Documents fusionnés et téléchargés avec succès pour l'offre ID: ${offer.id}.`);
    } catch (error: any) { // Correction du typage de 'error'
      console.error(`[ERREUR] Échec de la fusion ou du téléchargement pour l'offre ID: ${offer.id}.`, error);
      this.documentLoadingError = `Erreur de chargement ou de fusion du document : ${error.message || 'Problème inconnu'}`;
    } finally {
      this.isDocumentLoading = false;
      this.currentLoadingDocumentOfferId = null;
      this.currentLoadingDocumentType = null;
    }
  }

  /**
   * Selects an offer and loads its associated Excel quote data.
   * MODIFIED: Now transforms raw devisDataFromDB into ExcelDevisData for display.
   * @param offer The offer to select.
   */
  selectOffer(offer: any) {
  this.selectedOffer = offer;
  this.cdr.detectChanges();

  this.excelDevisDataForDisplay = null;
  this.devisLoadError = '';
  this.loadingDevisData = true;
  
  this.fetchTenderDetails();

  if (this.selectedOffer && this.selectedOffer.devis_data) {
      let devisData: DevisItem[];
      if (typeof this.selectedOffer.devis_data === 'string') {
        try {
          devisData = JSON.parse(this.selectedOffer.devis_data);
        } catch (e) {
          console.error('Erreur lors du parsing des données de devis:', e);
          this.devisLoadError = 'Erreur lors du chargement des données de devis.';
          this.loadingDevisData = false;
          return;
        }
      } else {
        devisData = this.selectedOffer.devis_data;
      }

      if (devisData && devisData.length > 0) {
        const gridData = devisData.map((item: any) => [
          item.numero,
          item.designation,
          item.quantite,
          item.unite,
          item.pu_ht,
          item.pt_ht
        ]);

      // Calcul des totaux
      const headers = ['N°', 'Désignation', 'Quantité', 'Unité', 'Prix unitaire (HT)', 'Prix total (HT)'];
        this.excelDevisDataForDisplay = {
          gridData: [headers, ...gridData],
          metadata: {
            totalHTLabel: 'Total HT',
            tvaLabel: 'TVA',
            totalTTCLabel: 'TOTAL TTC'
          }
        };
        this.calculateDevisTotals(devisData);
      } else {
        this.devisLoadError = 'Aucune donnée de devis trouvée pour cette offre.';
      }
    } else {
      this.devisLoadError = 'Aucune donnée de devis trouvée pour cette offre.';
    }
    this.loadingDevisData = false;
  }

calculateDevisTotals(devisData: any[]): void {
    if (!devisData) {
      this.totalHTDevis = 0;
      this.tvaDevis = 0;
      this.totalTTCDevis = 0;
      return;
    }

    this.totalHTDevis = devisData.reduce((acc, item) => {
      if (item && item.pt_ht && typeof item.pt_ht === 'number') {
        return acc + item.pt_ht;
      }
      return acc;
    }, 0);

    const tvaRate = 0.20;
    this.tvaDevis = this.totalHTDevis * tvaRate;

    this.totalTTCDevis = this.totalHTDevis + this.tvaDevis;
  }

  selectOfferById(id: string) {
    const offer = this.rowData.find(o => o.id === id);
    if (offer) {
      this.selectOffer(offer);
    }
  }
  
  getSortedOffersByPrice(): void {
    this.sortedOffersByPrice = [...this.rowData].sort((a, b) => a.montantTotal - b.montantTotal);
  }
  sortOffers(criteria: string): void {
    if (criteria === 'price') {
      this.rowData.sort((a, b) => a.montantTotal - b.montantTotal);
    }
  }

  
  /**
   * Sets the currently selected tab (technical or financial).
   * @param tab The tab to select.
   */
  selectTab(tab: 'technical' | 'financial'): void {
    this.selectedTab = tab;
  }

  async validateDecision(): Promise<void> {
  // 1. Vérifiez s'il y a une offre ET un appel d'offres sélectionnés avant de continuer
  if (!this.selectedOffer || !this.selectedTenderOffer) {
    console.error('Veuillez sélectionner une offre et un appel d\'offres.');
    this.aoFeedbackMessage = 'Veuillez sélectionner une offre et un appel d\'offres avant de valider.';
    this.isAoError = true;
    return;
  }

  try {
    // 2. Convertir les types de données pour qu'ils correspondent à la base de données
    const idFournisseurToStore = this.selectedOffer.fournisseur.idFournisseur;

    // 3. Vérifier si la conversion a réussi
    // 1. On récupère la référence sélectionnée

// 2. On récupère l’ID numérique correspondant
const refAO = this.selectedTenderOffer; // ex: "AO-N°01/2025"
const { data: aoRow, error: aoError } = await this.supabaseService
  .getClient()
  .from('appels_offres')
  .select('id_appel')
  .eq('numeroAO', refAO)
  .single();

if (aoError || !aoRow) {
  throw new Error('Impossible de trouver l’appel d’offres correspondant.');
}

const idAppelToStore = aoRow.id_appel;

    // 4. Insertion des données dans la nouvelle table 'decision'
    const { data, error } = await this.supabaseService
  .getClient()
  .from('decision')
  .insert([
    {
      id_appel: idAppelToStore,
      id_fournisseur: idFournisseurToStore,
      fournisseur_retenu: this.vendorRetenu,
      fournisseur_non_retenu: this.vendorNonRetenu,
      commentaire: this.decisionComment
      
    }
  ]);

    if (error) {
      throw error;
    }

    console.log('Décision enregistrée avec succès:', data);

    // 5. Mise à jour de l'état de l'appel d'offres
    this.aoData.statut = 'Attribué';

    // 6. Enregistrement de la décision dans l'historique de l'application
    const newDecision: DecisionHistoryItem = {
      date: new Date(),
      status: 'Validée',
      comment: this.decisionComment || `Attribution à ${this.selectedOffer.fournisseur.nom}.`
    };
    this.decisionHistory.push(newDecision);
    this.decisionComment = '';
    
    this.aoFeedbackMessage = `La décision a été enregistrée avec succès.`;
    this.isAoError = false;

    this.cdr.detectChanges();
  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement de la décision:', error);
    this.aoFeedbackMessage = `Erreur lors de la validation : ${error.message || 'Problème inconnu'}`;
    this.isAoError = true;
  }
}


  /**
   * Requests a modification for the selected offer, sets the AO status to 'Pending decision'.
   */
  requestModification(): void {
    this.aoData.statut = 'En attente de décision';
    const newDecision: DecisionHistoryItem = {
      date: new Date(),
      status: 'Modification request',
      comment: this.decisionComment || 'Modification request for the selected offer.'
    };
    this.decisionHistory.push(newDecision);
    this.decisionComment = '';
    this.saveAoDetails(null as any); // Save AO details after decision
    this.cdr.detectChanges(); // Trigger change detection
  }

  /**
   * Rejects the decision for the selected offer, sets the AO status to 'Cancelled'.
   */
  rejectDecision(): void {
    this.aoData.statut = 'Annulé';
    const newDecision: DecisionHistoryItem = {
      date: new Date(),
      status: 'Rejected',
      comment: this.decisionComment || 'Tender rejection decision.'
    };
    this.decisionHistory.push(newDecision);
    this.decisionComment = '';
    this.saveAoDetails(null as any); // Save AO details after decision
    this.cdr.detectChanges(); // Trigger change detection
  }

  /**
   * Loads dummy decision history. In a real application, this would come from a backend.
   */
  loadDecisionHistory(): void {
    this.decisionHistory = [
      { date: new Date('2025-06-20'), status: 'Pending decision', comment: 'Initial evaluation.' }
    ];
  }

  /**
   * Loads dummy message history. In a real application, this would come from a backend.
   */
  loadMessagesHistory(): void {
    this.loadingMessages = true;
    this.errorMessage = '';
    setTimeout(() => {
      this.messagesHistory = [...this.originalMessagesHistory];
      this.loadingMessages = false;
      this.cdr.detectChanges();
    }, 500); // Simulate network delay
  }

  /**
   * Filters messages based on a search term (supplier ID).
   */
  filterMessages(): void {
    if (this.searchTerm.trim() === '') {
      this.messagesHistory = [...this.originalMessagesHistory];
    } else {
      this.messagesHistory = this.originalMessagesHistory.filter(msg =>
        msg.fournisseurId.toLowerCase().includes(this.searchTerm.trim().toLowerCase())
      );
    }
  }

  /**
   * Formats a date string into a readable French format.
   * @param dateString The date string to format.
   * @returns The formatted date string.
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Navigates to the dashboard.
   */
  historyBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
