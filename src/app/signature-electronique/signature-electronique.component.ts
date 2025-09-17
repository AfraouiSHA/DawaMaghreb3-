import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
  OnDestroy,
  ChangeDetectorRef
} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';


import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

import { HttpClient } from "@angular/common/http";
// Importation de la bibliothèque de suppression de fond retirée
// import { removeBackground } from "@imgly/background-removal";
import { PdfViewerModule, PDFDocumentProxy } from "ng2-pdf-viewer";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

import { SupabaseService } from "src/app/services/supabase.service";
import { SignatureService } from "src/app/services/signature.service"; // NOUVELLE IMPORTATION
import { DocumentToSignService } from '../services/document-to-sign.service';
import { Subscription } from 'rxjs'; 

// Angular Material imports
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatRadioModule } from "@angular/material/radio";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatOptionModule } from "@angular/material/core";
import { MatSliderModule } from "@angular/material/slider";

// ... (Gardez toutes vos interfaces existantes ici)
interface SignatureElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pdfX: number;
  pdfY: number;
  pdfWidth: number;
  pdfHeight: number;
  imageDataUrl: string;
  page: number;
  selected: boolean;
  rotation: number;
  opacity: number;
  aspectRatio: number;
}
interface AuditEntry {
  timestamp: Date;
  action: string;
  details?: any;
  isError?: boolean;
}
interface Signataire {
  nom: string;
  email: string;
  fonction: string;
  signe: boolean;
  dateSignature?: string;
  signatureImage?: string;
  
}
interface SignaturePreset {
  name: string;
  width: number;
  height: number;
  description: string;
}
interface HistoryState {
  signatureElement: SignatureElement | null;
  action: string;
  timestamp: Date;
}
interface SimplePdfDimensions {
  pdfWidth: number;
  pdfHeight: number;
  viewerWidth: number;
  viewerHeight: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}
interface Participant {
  nom: string;
  email: string;
  fonction: string;
  signe: boolean;
  entreprise?: string;     // ✅ Ajout de la propriété entreprise
  dateSignature?: string;  // ✅ Ajout de la propriété dateSignature
}

interface PvDocument {
  id: string;
  file_url: string;
  file_name?: string;
  pv_title?: string;
  pv_number?: string;
  pv_date?: string;
  pv_lieu?: string;
  pv_redacteur?: string;
  pv_participants: Participant[];
  }









// ... (fin des interfaces)

@Component({
  selector: "app-signature-electronique",
  templateUrl: "./signature-electronique.component.html",
  styleUrls: ["./signature-electronique.component.css"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PdfViewerModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatOptionModule,
    MatSliderModule,
    DatePipe,
  ],
  providers: [DatePipe, MatSnackBar],
  
})

export class SignatureElectroniqueComponent implements OnInit, AfterViewInit, OnDestroy {
  // ... (Gardez toutes vos propriétés existantes ici)
  @ViewChild("pdfContainer") pdfContainer!: ElementRef;
  @ViewChild("pdfViewerComp", { static: false }) pdfViewerComp: any;
  
  documentUrl: string | null = null;
  public Math = Math;
  pdfSrc: SafeUrl | null = null;
  page: number = 1;
  totalPages: number = 0;
  fileName: string | null = null;
  signatureImageSrc: string | SafeUrl | null = null;
  signatureFile: File | null = null;
  isProcessingSignature = false;
  isSigning = false;
  processedSignatureUrl: string | null = null;
  signatureElement: SignatureElement | null = null;
  isSignatureConfirmed = false;
  isDocumentLocked = false;
  
  

  isDragging = false;
  isResizing = false;
  isPlacingSignature = false;
  resizeHandle: string | null = null;
  placementMode: "click" | "draw" | "preset" = "click";

  initialMouseX = 0;
  initialMouseY = 0;
  initialSignatureX = 0;
  initialSignatureY = 0;
  initialSignatureWidth = 0;
  initialSignatureHeight = 0;
pvParticipants: Participant[] = [];
signataires: Participant[] = [];
signatairesRestants: Participant[] = [];
  utilisateur: Participant = { nom: "", email: "", fonction: "", signe: false };

  private pdfViewer: HTMLCanvasElement | null = null;
  private pdfDocProxy: PDFDocumentProxy | null = null;
  public pdfDimensions: SimplePdfDimensions | null = null;
    private documentSubscription: Subscription = new Subscription(); 
     
     
        public document: any = { isSigned: false };
         public isPdfLoaded = false;
    
       documentId: string | null = null;
  documentToSign: PvDocument | null = null;
  loading = false;
  previewUrl: SafeUrl | null = null;

 

  public globalOffsetX = 0;
  public globalOffsetY = 0;

  showGrid = false;
  snapToGrid = true;
  gridSize = 10;
  showGuides = true;

  previewSignature: SignatureElement | null = null;

  currentPage = 1;

  isLoadingPdf = false;
  showSignaturePreview = false;
  showPropertiesPanel = false;

  acceptConditions = false;

  signaturePresets: SignaturePreset[] = [
    { name: "Petit", width: 100, height: 40, description: "Signature compacte" },
    { name: "Moyen", width: 150, height: 60, description: "Taille standard" },
    { name: "Grand", width: 200, height: 80, description: "Signature proéminente" },
    { name: "Extra Large", width: 250, height: 100, description: "Signature de titre" },
  ];
  selectedPreset: SignaturePreset = this.signaturePresets[1];

  history: HistoryState[] = [];
  historyIndex = -1;
  maxHistorySize = 20;

  auditEntries: AuditEntry[] = [];
  
 
 private async loadDocument(docId: string): Promise<void> {
  const { data, error } = await this.supabaseService.getDocument(docId);
 if (error) {
  console.error('Erreur lors du chargement du document :', error);
  this.router.navigate(['/telechargement-pv']);
  return;
  
}


if (!data) {
  console.warn('Aucun document trouvé pour cet ID');
  this.router.navigate(['/telechargement-pv']);
  return;
}

console.log('✅ Document chargé :', data);
 }  
  private originalPdfData: Uint8Array | null = null;
  isCalibrationMode = false;
  calibrationPoint: { x: number; y: number } | null = null;
  referencePoints: Array<{ viewerX: number; viewerY: number; pdfX: number; pdfY: number; label: string }> = [];
  calculatedOffsetX = 0;
  calculatedOffsetY = 0;

  get opacitySliderValue(): number {
    return this.signatureElement ? this.signatureElement.opacity * 100 : 100;
  }
  set opacitySliderValue(value: number) {
    if (this.signatureElement && value !== null) {
      this.signatureElement.opacity = value / 100;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,

    private http: HttpClient,
    private supabaseService: SupabaseService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private signatureService: SignatureService, // NOUVELLE INJECTION
    private cdr: ChangeDetectorRef,
    private documentToSignService: DocumentToSignService,
    private sanitizer: DomSanitizer,
    private cd: ChangeDetectorRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
    
  ngOnInit(): void {
  // Récupération unique des queryParams
  this.route.queryParams.subscribe(async params => {
    const docUrl = params['url'];
    this.documentId = this.route.snapshot.queryParamMap.get('docId');
    if (this.documentId) {
      await this.loadDocument(this.documentId);
    } else {
      console.error("L'ID du document est manquant dans l'URL.");
      this.router.navigate(['/telechargement-pv']);
    }
    if (docUrl) {
      const url = params['url']; 
      this.documentUrl = docUrl;
      await this.loadPdfFromUrl(url);
      this.loadPdfFromUrl(docUrl);
      this.addAuditEntry(`Chargement du document depuis l'URL: ${docUrl}`);
        return;

      this.addAuditEntry(`Chargement du document depuis l'URL: ${docUrl}`);
      
      // Pour les URLs de type "blob:" ou données binaires
      if (docUrl.startsWith('blob:') || docUrl.startsWith('data:')) {
        this.pdfSrc = docUrl;
      } 
      // Pour les URLs Supabase (https://...)
      else {
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(docUrl);
      }
      
      this.fileName = this.getFileNameFromUrl(docUrl);
      this.documentUrl = docUrl;
      
      console.log("Document chargé:", this.fileName);
    } else {
      console.error("Aucune URL de document fournie");
      this.addAuditEntry("Erreur: URL du document manquante", null, true);
    }
   
  });

  this.addAuditEntry("Application initialisée");
  
  // Reste de votre code existant...
  this.documentSubscription = this.documentToSignService.currentDocument.subscribe(
    (doc: any) => {
      if (doc && doc.file_url) {
        this.document = doc;
        this.fileName = doc.file_name;
        this.pdfSrc = doc.file_url;
        this.addAuditEntry(`Document "${this.fileName}" chargé via le service.`);
      }
    }
  );

  console.log('✅ Je suis bien dans signature-electronique');
console.log('📄 Query params :', this.route.snapshot.queryParams);


  // S'abonne au service pour récupérer le document qui a été passé depuis la page précédente
  this.documentSubscription = this.documentToSignService.currentDocument.subscribe(
    (doc: any) => {
      // Vérifie si un document est disponible via le service
      if (doc && doc.file_url) {
        // Logique pour le cas où un PV a été passé depuis la page de téléchargement
        this.document = doc;
        this.fileName = doc.file_name;
        this.pdfSrc = doc.file_url;
        this.addAuditEntry(`Document "${this.fileName}" chargé via le service.`);
      }
    }
  )
};

private filterSignataires(): void {
  this.signatairesRestants = this.signataires.filter(s => !s.signe);
  console.log('📋 Participants dans la base :', this.signataires);
console.log('✉️  Email que vous avez tapé :', this.utilisateur.email);
}

/* 2.  Chargement + mise à jour tableaux  */
async loadDocumentAndParticipants(): Promise<void> {
  if (!this.documentId) {                         // un seul test suffit
    console.error('Document ID is missing.');
    return;
  }

  const { data, error } = await this.supabaseService.getPvDetails(this.documentId);
  if (error) {
    console.error('Error fetching document details:', error);
    this.snackBar.open('Erreur lors du chargement des participants.', 'Fermer', { duration: 3000 });
    return;
  }

  if (data?.pv_participants) {
    this.signataires = data.pv_participants;
    this.filterSignataires();                     // rafraîchit l’affichage
    console.table(this.signataires);
  }
}

/* 3.  Sauvegarde signature  */
async saveUserData(): Promise<void> {
  /* comparaison insensible à la casse / espaces */
 const participantEnCours = this.signataires.find(
  p => p.nom?.trim().toLowerCase() === this.utilisateur.nom.trim().toLowerCase()
);

  if (!participantEnCours) {
    this.snackBar.open('Vous n’êtes pas un participant enregistré pour ce document.', 'Fermer');
    return;
  }

  /* mise à jour locale */
  participantEnCours.nom = this.utilisateur.nom;
  participantEnCours.fonction = this.utilisateur.fonction;
  participantEnCours.entreprise = this.utilisateur.entreprise;
  participantEnCours.signe = true;
  participantEnCours.dateSignature = new Date().toISOString();

  /* sauvegarde BDD */
  if (!this.documentId) {
    this.snackBar.open('ID document manquant.', 'Fermer');
    return;
  }

  const { error } = await this.supabaseService.updatePvParticipants(this.documentId, this.signataires);
  if (error) {
    this.snackBar.open('Erreur lors de la sauvegarde de la signature.', 'Fermer');
  } else {
    this.snackBar.open('Signature sauvegardée avec succès !', 'Fermer', { duration: 3000 });
    this.filterSignataires();   // recharge la liste « restants »
  }
}











 







  ngOnDestroy(): void {
    document.removeEventListener("mousemove", this.onGlobalMouseMove.bind(this));
    document.removeEventListener("mouseup", this.onGlobalMouseUp.bind(this));
  }

 private getFileNameFromUrl(url: string): string {
    const parts = url.split('/');
    const fullFileName = parts[parts.length - 1];
    const cleanFileName = fullFileName.replace(/-\d{13}\.pdf$/, '.pdf');
    return cleanFileName;
  }

private async loadPdfFromUrl(url: string): Promise<void> {
  try {
    const blob = await this.http.get(url, { responseType: 'blob' }).toPromise();
    if (!blob) throw new Error('Blob vide');

    // 1. Affichage immédiat
    const objectUrl = URL.createObjectURL(blob);
    this.pdfSrc = objectUrl;

    // 2. Stockage pour la finalisation
    const arrayBuffer = await blob.arrayBuffer();
    this.originalPdfData = new Uint8Array(arrayBuffer);

    this.fileName = this.getFileNameFromUrl(url);
    this.addAuditEntry('PDF distant chargé et stocké pour signature.');
    this.isPdfLoaded = true;
  } catch (err) {
    this.handleError('Erreur lors du chargement du PDF distant', err);
  }
}
  
  public async calculateSimpleDimensions(): Promise<void> {
    if (!this.pdfDocProxy || !this.pdfViewer) {
      console.warn("calculateSimpleDimensions: Données manquantes (pdfDocProxy ou pdfViewer)");
      return;
    }
    


    try {
      const page = await this.pdfDocProxy.getPage(this.currentPage);
      const viewport = page.getViewport({ scale: 1 });

      const pdfWidth = viewport.width;
      const pdfHeight = viewport.height;
      const viewerWidth = this.pdfViewer.offsetWidth;
      const viewerHeight = this.pdfViewer.offsetHeight;
      const scaleFactorX = viewerWidth / pdfWidth;
      const scaleFactorY = viewerHeight / pdfHeight;
      const actualRenderScale = Math.min(scaleFactorX, scaleFactorY);
      const renderedPdfWidth = pdfWidth * actualRenderScale;
      const renderedPdfHeight = pdfHeight * actualRenderScale;
      const offsetX = (viewerWidth - renderedPdfWidth) / 2;
      const offsetY = (viewerHeight - renderedPdfHeight) / 2;

      this.pdfDimensions = {
        pdfWidth,
        pdfHeight,
        viewerWidth,
        viewerHeight,
        scaleX: pdfWidth / renderedPdfWidth,
        scaleY: pdfHeight / renderedPdfHeight,
        offsetX,
        offsetY,
      };

      this.addAuditEntry("Dimensions PDF calculées", {
        pdfDimensions: this.pdfDimensions,
      });
    } catch (error) {
      console.error("Erreur lors du calcul des dimensions:", error);
      this.addAuditEntry("Erreur calcul dimensions", error, true);
    }
  }
  

  public convertViewerToPdfCoords(
    viewerX: number,
    viewerY: number,
    viewerWidth: number,
    viewerHeight: number
  ): { pdfX: number; pdfY: number; pdfWidth: number; pdfHeight: number } {
    if (!this.pdfDimensions) {
      console.warn("convertViewerToPdfCoords: Dimensions PDF non disponibles. Retourne 0.");
      return { pdfX: 0, pdfY: 0, pdfWidth: 0, pdfHeight: 0 };
    }

    const { pdfWidth, pdfHeight, offsetX, offsetY, scaleX, scaleY } = this.pdfDimensions;

    const adjustedX = viewerX - offsetX + this.globalOffsetX + this.calculatedOffsetX;
    const adjustedY = viewerY - offsetY + this.globalOffsetY + this.calculatedOffsetY;

    const pdfX = adjustedX * scaleX;
    const pdfY = pdfHeight - (adjustedY * scaleY) - (viewerHeight * scaleY);
    
    const pdfW = viewerWidth * scaleX;
    const pdfH = viewerHeight * scaleY;

    return { 
      pdfX: pdfX, 
      pdfY: pdfY, 
      pdfWidth: pdfW, 
      pdfHeight: pdfH 
    };
  }

  private safeArrayBufferCopy(buffer: ArrayBuffer): ArrayBuffer {
    const copy = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(copy).set(new Uint8Array(buffer));
    return copy;
  }

  addAuditEntry(action: string, details?: any, isError = false): void {
    let formattedDetails = details;
    if (isError && typeof details === "object" && details !== null) {
      formattedDetails = details.message || JSON.stringify(details);
    } else if (details === undefined) {
      formattedDetails = null;
    }

    this.auditEntries.unshift({
      timestamp: new Date(),
      action: action,
      details: formattedDetails,
      isError: isError,
    });
    if (this.auditEntries.length > 50) {
      this.auditEntries.pop();
    }
    if (isError) {
      console.error("Audit Error:", action, formattedDetails);
    } else {
      console.log("Audit:", action, formattedDetails || "");
    }
  }

  saveToHistory(action: string): void {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push({
      signatureElement: this.signatureElement ? { ...this.signatureElement } : null,
      action: action,
      timestamp: new Date(),
    });
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
    this.addAuditEntry(`History saved: ${action}`);
  }

  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const state = this.history[this.historyIndex];
      this.signatureElement = state.signatureElement ? { ...state.signatureElement } : null;
      this.addAuditEntry(`Annulation: ${state.action}`);
    } else if (this.historyIndex === 0) {
      this.historyIndex--;
      this.signatureElement = null;
      this.addAuditEntry("Annulation à l'état initial (signature effacée)");
    }
  }

  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const state = this.history[this.historyIndex];
      this.signatureElement = state.signatureElement ? { ...state.signatureElement } : null;
      this.addAuditEntry(`Rétablissement: ${state.action}`);
    }
  }

  canUndo(): boolean {
    return this.historyIndex > -1;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        this.snackBar.open("Veuillez sélectionner un fichier PDF valide.", "Fermer", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        });
        this.addAuditEntry("Erreur: Type de fichier invalide", { type: file.type }, true);
        return;
      }
      this.fileName = file.name;
      this.isLoadingPdf = true;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          try {
            const arrayBuffer = e.target.result as ArrayBuffer;
            if (arrayBuffer.byteLength === 0) {
              throw new Error("Le fichier PDF est vide");
            }

            const uint8Array = new Uint8Array(arrayBuffer.byteLength);
            const sourceView = new Uint8Array(arrayBuffer);

            for (let i = 0; i < arrayBuffer.byteLength; i++) {
              uint8Array[i] = sourceView[i];
            }

            const header = new TextDecoder().decode(uint8Array.slice(0, 5));
            if (!header.startsWith("%PDF")) {
              throw new Error("Le fichier ne semble pas être un PDF valide");
            }

            this.originalPdfData = uint8Array;
            this.pdfSrc = new Uint8Array(uint8Array);

            this.addAuditEntry("Fichier PDF sélectionné et validé", {
              fileName: this.fileName,
              size: uint8Array.length,
            });

            console.log("PDF loaded and stored, size:", uint8Array.length);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
            this.addAuditEntry("Erreur lors de la validation du PDF", { error: errorMessage }, true);
            this.snackBar.open(`Erreur lors du chargement du PDF: ${errorMessage}`, "Fermer", {
              duration: 5000,
              panelClass: ["error-snackbar"],
            });
          } finally {
            this.isLoadingPdf = false;
          }
        }
      };
      reader.onerror = () => {
        this.isLoadingPdf = false;
        this.addAuditEntry("Erreur de lecture du fichier", null, true);
        this.snackBar.open("Erreur lors de la lecture du fichier", "Fermer", {
          duration: 5000,
          panelClass: ["error-snackbar"],
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      this.fileName = "Aucun fichier choisi";
      this.pdfSrc = null;
      this.originalPdfData = null;
      this.addAuditEntry("Sélection de fichier annulée");
    }
  }


   






   
   private delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

   public async onPdfLoadComplete(pdf: PDFDocumentProxy): Promise<void> {
  console.log('PDF proxy', pdf.numPages);
  this.pdfDocProxy = pdf;
  this.totalPages = pdf.numPages;
  this.addAuditEntry('PDF chargé avec succès', { pages: this.totalPages });
  await this.loadDocumentAndParticipants();

  this.pdfViewer = await this.findPdfCanvasElement(); // <-- now async
  if (this.pdfViewer) {
    console.log('onPdfLoadComplete : pdfViewer (canvas) trouvé');
    await this.calculateSimpleDimensions();
    this.addAuditEntry('PDF viewer initialisé', {
      canvasSize: { width: this.pdfViewer.offsetWidth, height: this.pdfViewer.offsetHeight },
      pdfDimensions: this.pdfDimensions,
    });
  } else {
    console.error('onPdfLoadComplete : Impossible de trouver le canvas');
    this.snackBar.open('Erreur : Impossible de détecter le visualiseur PDF.', 'Fermer', {
      duration: 7000,
      panelClass: ['error-snackbar'],
    });
  }
  this.isLoadingPdf = false;
}

 ngAfterViewInit(): void {
    document.addEventListener("mousemove", this.onGlobalMouseMove.bind(this));
    document.addEventListener("mouseup", this.onGlobalMouseUp.bind(this));
  }

  private async findPdfCanvasElement(): Promise<HTMLCanvasElement | null> {
  const MAX_TRIES = 30; // 3 secondes max (30 × 100 ms)
  let tries = 0;

  while (tries < MAX_TRIES) {
    const pdfViewerHost = this.pdfContainer?.nativeElement?.querySelector('pdf-viewer');
    const canvas = pdfViewerHost?.querySelector('canvas');

    if (canvas instanceof HTMLCanvasElement && canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
      console.log('✅ findPdfCanvasElement : canvas trouvé avec dimensions valides');
      return canvas;
    }

    tries++;
    console.warn(`⏳ findPdfCanvasElement : tentative ${tries} échouée – on réessaye…`);
    await this.delay(100); // 100 ms
  }

  console.error('❌ findPdfCanvasElement : canvas non trouvé après toutes les tentatives');
  return null;
}

  public async onSignatureFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    this.isProcessingSignature = true;
    this.snackBar.open("Traitement de la signature en cours. Veuillez patienter...", "Fermer", {
      duration: 0,
      panelClass: ["info-snackbar"],
    });
    this.addAuditEntry("Début du traitement de la signature pour supprimer le fond (via serveur).");

    try {
      // Envoi de l'image au serveur pour traitement
      const resultBlob = await this.signatureService.uploadSignature(file).toPromise();

      // **CORRECTION : Ajoutez cette vérification pour vous assurer que resultBlob n'est pas undefined**
      if (resultBlob) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.processedSignatureUrl = e.target?.result as string;
          this.signatureElement = null;
          this.addAuditEntry("Signature traitée et prête à être placée.", { fileName: file.name });
          this.isProcessingSignature = false;
          this.snackBar.open("Signature traitée avec succès !", "Fermer", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
          this.setPlacementMode("click");
          this.cdr.detectChanges();
        };
        // Cette ligne est maintenant sûre car resultBlob a été vérifié
        reader.readAsDataURL(resultBlob);
      } else {
        // Gérer le cas où le Blob est undefined
        throw new Error("Le serveur n'a pas renvoyé d'image traitée.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du fond sur le serveur:", error);
      this.addAuditEntry("Erreur lors de la suppression du fond (serveur).", { error: error }, true);
      this.isProcessingSignature = false;
      this.snackBar.open("Erreur lors du traitement de la signature. Veuillez réessayer.", "Fermer", {
        duration: 5000,
        panelClass: ["error-snackbar"],
      });
      this.cdr.detectChanges();
    }
  } else {
    this.processedSignatureUrl = null;
    this.addAuditEntry("Sélection de signature annulée");
  }
}

  setPlacementMode(mode: "click" | "draw" | "preset"): void {
    if (!this.processedSignatureUrl) {
      this.snackBar.open("Veuillez d'abord télécharger une signature pour l'utiliser.", "Fermer", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      });
      return;
    }
    this.placementMode = mode;
    this.isPlacingSignature = true;
    this.previewSignature = null;
    if (this.pdfContainer?.nativeElement) {
      const container = this.pdfContainer.nativeElement;
      container.style.cursor = "copy";
    }
    this.addAuditEntry(`Mode de placement activé: ${mode}`);
    this.snackBar.open(`Mode de placement: Cliquez sur le PDF pour placer la signature.`, "Fermer", {
      duration: 4000,
      panelClass: ["info-snackbar"],
    });
  }

  cancelPlacement(): void {
    this.isPlacingSignature = false;
    this.previewSignature = null;
    this.placementMode = "click";
    if (this.pdfContainer?.nativeElement) {
      this.pdfContainer.nativeElement.style.cursor = "default";
    }
    this.addAuditEntry("Placement de signature annulé");
    this.snackBar.open("Placement de signature annulé.", "Fermer", { duration: 2000 });
  }

  public onPdfClick(event: MouseEvent): void {
    const { x, y } = this.getRelativePosition(event);

    if (this.isCalibrationMode) {
      this.calibrationPoint = { x, y };
      const expectedX = prompt("Entrez la coordonnée X attendue dans le PDF (en points):");
      const expectedY = prompt("Entrez la coordonnée Y attendue dans le PDF (en points):");

      if (expectedX !== null && expectedY !== null) {
        const pdfX = Number.parseFloat(expectedX);
        const pdfY = Number.parseFloat(expectedY);

        if (!isNaN(pdfX) && !isNaN(pdfY)) {
          this.calibrateWithPoint(x, y, pdfX, pdfY);
          this.cancelCalibrationMode();
          return;
        }
      }
      this.cancelCalibrationMode();
      return;
    }

    if (!this.isPlacingSignature || !this.processedSignatureUrl) {
      return;
    }

    if (!this.pdfViewer || !this.pdfDimensions) {
      console.error("onPdfClick: Visualiseur PDF ou dimensions non disponibles");
      this.snackBar.open("Erreur: Le visualiseur PDF n'est pas prêt.", "Fermer", {
        duration: 5000,
        panelClass: ["error-snackbar"],
      });
      return;
    }

    this.signatureElement = {
      id: `sig-${Date.now()}`,
      x:  x -this.selectedPreset.width / 2,
      y: y - this.selectedPreset.height / 2,
      width: this.selectedPreset.width,
      height: this.selectedPreset.height,
      imageDataUrl: this.processedSignatureUrl,
      page: this.currentPage,
      selected: true,
      rotation: 0,
      opacity: 1,
      aspectRatio: this.selectedPreset.width / this.selectedPreset.height,
      pdfX: 0,
      pdfY: 0,
      pdfWidth: 0,
      pdfHeight: 0,
    };

    this.updateSignaturePdfCoordinates();
    this.saveToHistory("Placement de signature");

    this.addAuditEntry("Signature placée", {
      x: this.signatureElement.x,
      y: this.signatureElement.y,
      page: this.currentPage,
      calibrationStatus: this.getCalibrationStatus(),
    });

    this.isPlacingSignature = false;
    this.previewSignature = null;
    this.showPropertiesPanel = true;

    this.snackBar.open("Signature placée ! Utilisez les contrôles pour ajuster si nécessaire.", "Fermer", {
      duration: 3000,
      panelClass: ["success-snackbar"],
    });
  }

  public getRelativePosition(event: MouseEvent): { x: number; y: number } {
    if (!this.pdfViewer) {
      console.warn("getRelativePosition: pdfViewer non disponible");
      return { x: 0, y: 0 };
    }

    const pdfViewerRect = this.pdfViewer.getBoundingClientRect();
    const x = event.clientX - pdfViewerRect.left;
    const y = event.clientY - pdfViewerRect.top;
    return { x, y };
  }

  public updateSignaturePdfCoordinates(): void {
    if (!this.signatureElement) {
      console.warn("updateSignaturePdfCoordinates: Signature non disponible");
      return;
    }

    const convertedCoords = this.convertViewerToPdfCoords(
      this.signatureElement.x,
      this.signatureElement.y,
      this.signatureElement.width,
      this.signatureElement.height,
    );

    this.signatureElement.pdfX = convertedCoords.pdfX;
    this.signatureElement.pdfY = convertedCoords.pdfY;
    this.signatureElement.pdfWidth = convertedCoords.pdfWidth;
    this.signatureElement.pdfHeight = convertedCoords.pdfHeight;

    console.log("Coordonnées PDF mises à jour:", convertedCoords);
  }

  adjustGlobalOffsetX(delta: number): void {
    this.globalOffsetX += delta;
    if (this.signatureElement) {
      this.updateSignaturePdfCoordinates();
    }
    this.addAuditEntry(`Décalage horizontal global ajusté: ${this.globalOffsetX}`);
    this.snackBar.open(`Décalage horizontal: ${this.globalOffsetX} points`, "Fermer", {
      duration: 1000,
    });
  }

  adjustGlobalOffsetY(delta: number): void {
    this.globalOffsetY += delta;
    if (this.signatureElement) {
      this.updateSignaturePdfCoordinates();
    }
    this.addAuditEntry(`Décalage vertical global ajusté: ${this.globalOffsetY}`);
    this.snackBar.open(`Décalage vertical: ${this.globalOffsetY} points`, "Fermer", {
      duration: 1000,
    });
  }

  resetGlobalOffsets(): void {
    this.globalOffsetX = 0;
    this.globalOffsetY = 0;
    if (this.signatureElement) {
      this.updateSignaturePdfCoordinates();
    }
    this.addAuditEntry("Décalages globaux réinitialisés");
    this.snackBar.open("Décalages réinitialisés", "Fermer", { duration: 2000 });
  }

  applyPreset(preset: SignaturePreset): void {
    if (this.signatureElement) {
      this.saveToHistory("Application de preset");
      this.signatureElement.width = preset.width;
      this.signatureElement.height = preset.height;
      this.signatureElement.aspectRatio = preset.width / preset.height;
      this.updateSignaturePdfCoordinates();
      this.addAuditEntry(`Preset appliqué: ${preset.name}`, {
        width: this.signatureElement.width,
        height: this.signatureElement.height,
      });
    }
  }

  startDraggingSignature(event: MouseEvent): void {
    if (!this.signatureElement) return;
    this.isDragging = true;
    this.initialMouseX = event.clientX;
    this.initialMouseY = event.clientY;
    this.initialSignatureX = this.signatureElement.x;
    this.initialSignatureY = this.signatureElement.y;
    this.addAuditEntry("Début du déplacement de la signature");
    event.stopPropagation();
  }

  startResizingSignature(event: MouseEvent, handle: string): void {
    if (!this.signatureElement) return;
    event.stopPropagation();
    this.isResizing = true;
    this.resizeHandle = handle;
    this.initialMouseX = event.clientX;
    this.initialMouseY = event.clientY;
    this.initialSignatureX = this.signatureElement.x;
    this.initialSignatureY = this.signatureElement.y;
    this.initialSignatureWidth = this.signatureElement.width;
    this.initialSignatureHeight = this.signatureElement.height;
    this.addAuditEntry(`Début du redimensionnement (${handle})`);
  }

  @HostListener("document:mousemove", ["$event"])
  onGlobalMouseMove(event: MouseEvent): void {
    if (this.isPlacingSignature) {
      this.onPdfMouseMove(event);
    } else if (this.isDragging) {
      this.onSignatureDrag(event);
    } else if (this.isResizing) {
      this.onSignatureResize(event);
    }
  }

  @HostListener("document:mouseup")
  onGlobalMouseUp(): void {
    if (this.isDragging || this.isResizing) {
      this.saveToHistory(this.isDragging ? "Déplacement de signature" : "Redimensionnement de signature");
      this.updateSignaturePdfCoordinates();
    }

    const wasInteracting = this.isDragging || this.isResizing;
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = null;

    if (wasInteracting && this.signatureElement) {
      this.addAuditEntry("Fin de l'interaction avec la signature", {
        signatureId: this.signatureElement.id,
        position: {
          x: this.signatureElement.x,
          y: this.signatureElement.y,
          pdfX: this.signatureElement.pdfX,
          pdfY: this.signatureElement.pdfY,
        },
      });
    }
  }

  onPdfMouseMove(event: MouseEvent): void {
    if (!this.isPlacingSignature || !this.processedSignatureUrl) {
      this.previewSignature = null;
      return;
    }

    if (!this.pdfViewer) {
      this.previewSignature = null;
      return;
    }

    const { x, y } = this.getRelativePosition(event);

    this.previewSignature = {
      id: "preview",
      x: x - this.selectedPreset.width / 2,
      y: y - this.selectedPreset.height / 2,
      width: this.selectedPreset.width,
      height: this.selectedPreset.height,
      imageDataUrl: this.processedSignatureUrl,
      page: this.currentPage,
      selected: false,
      rotation: 0,
      opacity: 0.7,
      aspectRatio: this.selectedPreset.width / this.selectedPreset.height,
      pdfX: 0,
      pdfY: 0,
      pdfWidth: 0,
      pdfHeight: 0,
    };
  }

  onSignatureDrag(event: MouseEvent): void {
    if (!this.isDragging || !this.signatureElement) return;

    const dx = event.clientX - this.initialMouseX;
    const dy = event.clientY - this.initialMouseY;

    const newX = this.snapToGrid
      ? Math.round((this.initialSignatureX + dx) / this.gridSize) * this.gridSize
      : this.initialSignatureX + dx;
    const newY = this.snapToGrid
      ? Math.round((this.initialSignatureY + dy) / this.gridSize) * this.gridSize
      : this.initialSignatureY + dy;

    this.signatureElement.x = newX;
    this.signatureElement.y = newY;
  }

  onSignatureResize(event: MouseEvent): void {
    if (!this.isResizing || !this.signatureElement || !this.resizeHandle) return;

    const dx = event.clientX - this.initialMouseX;
    const dy = event.clientY - this.initialMouseY;

    let newWidth = this.initialSignatureWidth;
    let newHeight = this.initialSignatureHeight;
    let newX = this.initialSignatureX;
    let newY = this.initialSignatureY;

    const aspectRatio = this.signatureElement.aspectRatio;

    switch (this.resizeHandle) {
      case "br":
        newWidth = this.initialSignatureWidth + dx;
        newHeight = this.initialSignatureHeight + dy;
        break;
      case "bl":
        newWidth = this.initialSignatureWidth - dx;
        newHeight = this.initialSignatureHeight + dy;
        newX = this.initialSignatureX + dx;
        break;
      case "tr":
        newWidth = this.initialSignatureWidth + dx;
        newHeight = this.initialSignatureHeight - dy;
        newY = this.initialSignatureY + dy;
        break;
      case "tl":
        newWidth = this.initialSignatureWidth - dx;
        newHeight = this.initialSignatureHeight - dy;
        newX = this.initialSignatureX + dx;
        newY = this.initialSignatureY + dy;
        break;
    }

    if (newWidth > 20 && newHeight > 20) {
      if (Math.abs(dx) > Math.abs(dy)) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
    }

    if (newWidth < 20) newWidth = 20;
    if (newHeight < 20) newHeight = 20;

    if (this.snapToGrid) {
      newWidth = Math.round(newWidth / this.gridSize) * this.gridSize;
      newHeight = Math.round(newHeight / this.gridSize) * this.gridSize;
      newX = Math.round(newX / this.gridSize) * this.gridSize;
      newY = Math.round(newY / this.gridSize) * this.gridSize;
    }

    this.signatureElement.x = newX;
    this.signatureElement.y = newY;
    this.signatureElement.width = newWidth;
    this.signatureElement.height = newHeight;
  }

  public async goToPage(newPage: number): Promise<void> {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.addAuditEntry("Navigation de page", { page: this.currentPage });

      setTimeout(async () => {
        await this.calculateSimpleDimensions();
        if (this.signatureElement) {
          this.updateSignaturePdfCoordinates();
        }
      }, 500);
    }
  }

  confirmerSignature(): void {
    if (this.signatureElement) {
      this.isSignatureConfirmed = true;
      this.addAuditEntry("Signature confirmée", {
        id: this.signatureElement.id,
        globalOffsets: { x: this.globalOffsetX, y: this.globalOffsetY },
      });
      this.snackBar.open("Signature confirmée !", "Fermer", {
        duration: 2000,
        panelClass: ["success-snackbar"],
      });
    }
  }

  async applySignatureAndSavePdf(): Promise<void> {
    if (!this.pdfViewer || !this.pdfDimensions) {
      this.snackBar.open("Erreur: Le visualiseur PDF n'est pas prêt.", "Fermer", {
        duration: 5000,
        panelClass: ["error-snackbar"],
      });
      return;
    }

  if (!this.originalPdfData || !this.signatureElement || !this.processedSignatureUrl) {
  let msg = 'Données manquantes : ';
  if (!this.originalPdfData)       msg += 'PDF non chargé. ';
  if (!this.signatureElement)      msg += 'Signature non placée. ';
  if (!this.processedSignatureUrl) msg += 'Image de signature non chargée. ';
  this.snackBar.open(msg.trim(), 'Fermer', { duration: 5000, panelClass: ['error-snackbar'] });
  return;
}

    try {
      this.isProcessingSignature = true;
      this.snackBar.open("Application de la signature et sauvegarde du document...", "Fermer", {
        duration: 0,
        panelClass: ["info-snackbar"],
      });

      this.addAuditEntry("Début de l'application de la signature au PDF", {
        coordinates: {
          pdfX: this.signatureElement.pdfX,
          pdfY: this.signatureElement.pdfY,
          pdfWidth: this.signatureElement.pdfWidth,
          pdfHeight: this.signatureElement.pdfHeight,
        },
        globalOffsets: { x: this.globalOffsetX, y: this.globalOffsetY },
      });

      const pdfBuffer = this.originalPdfData.slice(0);
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const pageIndex = this.signatureElement.page - 1;
      const targetPage = pages[pageIndex];

      if (!targetPage) {
        throw new Error(`Page cible du PDF introuvable (page ${this.signatureElement.page}).`);
      }

      const response = await fetch(this.processedSignatureUrl);
      if (!response.ok) {
        throw new Error(`Erreur de chargement de la signature: ${response.statusText}`);
      }

      const pngImageBytes = await response.arrayBuffer();
      const signatureImage = await pdfDoc.embedPng(pngImageBytes);

      targetPage.drawImage(signatureImage, {
        x: this.signatureElement.pdfX-100,
        y: this.signatureElement.pdfY,
        width: this.signatureElement.pdfWidth,
        height: this.signatureElement.pdfHeight,
        rotate: degrees(this.signatureElement.rotation),
        opacity: this.signatureElement.opacity,
      });

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const auditText = `Signed by ${this.utilisateur.nom} (${this.utilisateur.email}) on ${this.datePipe.transform(new Date(), "medium")} - Global Offsets: X=${this.globalOffsetX}, Y=${this.globalOffsetY}`;
      targetPage.drawText(auditText, {
        x: 50,
        y: 20,
        font,
        size: 8,
        color: rgb(0.5, 0.5, 0.5),
      });

      const modifiedPdfBytes = await pdfDoc.save();
      const newFileName = `signé_${this.fileName}`;
      saveAs(new Blob([modifiedPdfBytes], { type: "application/pdf" }), newFileName);

      this.addAuditEntry("PDF signé et enregistré avec succès", {
        fileName: newFileName,
        globalOffsets: { x: this.globalOffsetX, y: this.globalOffsetY },
      });

      this.snackBar.open("Document signé et téléchargé avec succès !", "Fermer", {
        duration: 5000,
        panelClass: ["success-snackbar"],
      });

      this.isDocumentLocked = true;
      this.isProcessingSignature = false;
    } catch (error) {
      console.error("Erreur lors de l'application de la signature au PDF:", error);
      this.addAuditEntry("Erreur lors de la finalisation du PDF", error, true);
      this.isProcessingSignature = false;

      let errorMessage = "Une erreur est survenue lors de la finalisation du document.";
      if (error instanceof Error) {
        errorMessage += ` Détails: ${error.message}`;
      }

      this.snackBar.open(errorMessage, "Fermer", { duration: 5000, panelClass: ["error-snackbar"] });
    }
  }

  alignSignature(alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"): void {
    if (!this.signatureElement || !this.pdfViewer) return;

    this.saveToHistory(`Alignment: ${alignment}`);

    const viewerWidth = this.pdfViewer.offsetWidth;
    const viewerHeight = this.pdfViewer.offsetHeight;

    switch (alignment) {
      case "left":
        this.signatureElement.x = 0;
        break;
      case "center":
        this.signatureElement.x = (viewerWidth - this.signatureElement.width) / 2;
        break;
      case "right":
        this.signatureElement.x = viewerWidth - this.signatureElement.width;
        break;
      case "top":
        this.signatureElement.y = 0;
        break;
      case "middle":
        this.signatureElement.y = (viewerHeight - this.signatureElement.height) / 2;
        break;
      case "bottom":
        this.signatureElement.y = viewerHeight - this.signatureElement.height;
        break;
    }

    this.updateSignaturePdfCoordinates();
    this.addAuditEntry(`Signature alignée: ${alignment}`);
  }

  deleteSignature(): void {
    if (this.signatureElement) {
      this.saveToHistory("Signature supprimée");
      this.signatureElement = null;
      this.processedSignatureUrl = null;
      this.showPropertiesPanel = false;
      this.addAuditEntry("Signature supprimée");
      this.snackBar.open("Signature supprimée avec succès.", "Fermer", {
        duration: 2000,
        panelClass: ["success-snackbar"],
      });
    }
  }

  duplicateSignature(): void {
    if (this.signatureElement && this.signatureElement.imageDataUrl) {
      const duplicate: SignatureElement = {
        ...JSON.parse(JSON.stringify(this.signatureElement)),
        id: `sig-${Date.now()}-dup`,
        x: this.signatureElement.x + 20,
        y: this.signatureElement.y + 20,
        selected: true,
      };
      this.saveToHistory("Signature dupliquée");
      this.signatureElement = duplicate;
      this.updateSignaturePdfCoordinates();
      this.addAuditEntry("Signature dupliquée");
      this.snackBar.open("Signature dupliquée.", "Fermer", { duration: 2000, panelClass: ["success-snackbar"] });
    }
  }

  rotateSignature(angle: number): void {
    if (this.signatureElement) {
      this.saveToHistory("Signature tournée");
      this.signatureElement.rotation = ((this.signatureElement.rotation || 0) + angle) % 360;
      if (this.signatureElement.rotation < 0) {
        this.signatureElement.rotation += 360;
      }
      this.updateSignaturePdfCoordinates();
      this.addAuditEntry(`Signature tournée de ${angle}°`);
    }
  }

  getPrecisionStatus(): string {
    return this.pdfDimensions ? "Système calibré" : "Non calibré";
  }

  getPrecisionStatusColor(): string {
    return this.pdfDimensions ? "#4caf50" : "#f44336";
  }

  getCurrentAccuracy(): number {
    return this.pdfDimensions ? 95 : 0;
  }

  async recalculateDimensions(): Promise<void> {
    this.snackBar.open("Recalcul des dimensions...", "Fermer", { duration: 2000 });
    await this.calculateSimpleDimensions();
    if (this.signatureElement) {
      this.updateSignaturePdfCoordinates();
    }
    this.snackBar.open("Dimensions recalculées !", "Fermer", {
      duration: 3000,
      panelClass: ["success-snackbar"],
    });
  }

  testPrecisionAtPoint(x: number, y: number): void {
    this.snackBar.open(
      `Test au point (${x.toFixed(0)}, ${y.toFixed(0)}) - Décalages: X=${this.globalOffsetX}, Y=${this.globalOffsetY}`,
      "Fermer",
      {
        duration: 4000,
        panelClass: ["info-snackbar"],
      },
    );
  }

  validateConversion(): number {
    return this.pdfDimensions ? 95 : 0;
  }

  startCalibrationMode(): void {
    this.isCalibrationMode = true;
    this.calibrationPoint = null;
    if (this.pdfContainer?.nativeElement) {
      this.pdfContainer.nativeElement.style.cursor = "crosshair";
    }
    this.snackBar.open("Mode calibration activé. Cliquez sur un point de référence connu dans le PDF.", "Fermer", {
      duration: 5000,
      panelClass: ["info-snackbar"],
    });
    this.addAuditEntry("Mode calibration activé");
  }

  calibrateWithPoint(viewerX: number, viewerY: number, expectedPdfX: number, expectedPdfY: number): void {
    if (!this.pdfDimensions) {
      this.snackBar.open("Erreur: Dimensions PDF non calculées", "Fermer", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      });
      return;
    }

    const adjustedX = viewerX - this.pdfDimensions.offsetX + this.globalOffsetX;
    const adjustedY = viewerY - this.pdfDimensions.offsetY + this.globalOffsetY;

    const calculatedPdfX = adjustedX * this.pdfDimensions.scaleX;
    let calculatedPdfY = adjustedY * this.pdfDimensions.scaleY;
    calculatedPdfY = this.pdfDimensions.pdfHeight - calculatedPdfY;

    const errorX = expectedPdfX - calculatedPdfX;
    const errorY = expectedPdfY - calculatedPdfY;

    this.calculatedOffsetX = errorX;
    this.calculatedOffsetY = errorY;

    this.referencePoints.push({
      viewerX,
      viewerY,
      pdfX: expectedPdfX,
      pdfY: expectedPdfY,
      label: `Point ${this.referencePoints.length + 1}`,
    });

    this.addAuditEntry("Point de calibration ajouté", {
      viewer: { x: viewerX, y: viewerY },
      expectedPdf: { x: expectedPdfX, y: expectedPdfY },
      calculatedPdf: { x: calculatedPdfX, y: calculatedPdfY },
      corrections: { x: errorX, y: errorY },
    });

    this.snackBar.open(
      `Calibration effectuée ! Corrections: X=${errorX.toFixed(1)}, Y=${errorY.toFixed(1)}`,
      "Fermer",
      {
        duration: 4000,
        panelClass: ["success-snackbar"],
      },
    );

    if (this.signatureElement) {
      this.updateSignaturePdfCoordinates();
    }
  }

  autoCalibrate(): void {
    if (!this.pdfDimensions) {
      this.snackBar.open("Erreur: PDF non chargé", "Fermer", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      });
      return;
    }

    const standardPoints = [
      { viewerPercent: { x: 0.1, y: 0.1 }, pdfPoints: { x: 50, y: 792 } },
      { viewerPercent: { x: 0.9, y: 0.1 }, pdfPoints: { x: 545, y: 792 } },
      { viewerPercent: { x: 0.5, y: 0.5 }, pdfPoints: { x: 297.5, y: 421 } },
    ];

    let totalErrorX = 0;
    let totalErrorY = 0;
    let validPoints = 0;

    for (const point of standardPoints) {
      const viewerX = point.viewerPercent.x * this.pdfDimensions.viewerWidth;
      const viewerY = point.viewerPercent.y * this.pdfDimensions.viewerHeight;

      const adjustedX = viewerX - this.pdfDimensions.offsetX + this.globalOffsetX;
      const adjustedY = viewerY - this.pdfDimensions.offsetY + this.globalOffsetY;

      const calculatedPdfX = adjustedX * this.pdfDimensions.scaleX;
      let calculatedPdfY = adjustedY * this.pdfDimensions.scaleY;
      calculatedPdfY = this.pdfDimensions.pdfHeight - calculatedPdfY;

      const errorX = point.pdfPoints.x - calculatedPdfX;
      const errorY = point.pdfPoints.y - calculatedPdfY;

      totalErrorX += errorX;
      totalErrorY += errorY;
      validPoints++;
    }


    

    if (validPoints > 0) {
      this.calculatedOffsetX = totalErrorX / validPoints;
      this.calculatedOffsetY = totalErrorY / validPoints;

      this.addAuditEntry("Calibration automatique effectuée", {
        pointsUsed: validPoints,
        corrections: { x: this.calculatedOffsetX, y: this.calculatedOffsetY },
      });

      

      this.snackBar.open(
        `Calibration automatique terminée ! Corrections moyennes: X=${this.calculatedOffsetX.toFixed(1)}, Y=${this.calculatedOffsetY.toFixed(1)}`,
        "Fermer",
        {
          duration: 4000,
          panelClass: ["success-snackbar"],
        },
      );

      if (this.signatureElement) {
        this.updateSignaturePdfCoordinates();
      }
    }
  }

  cancelCalibrationMode(): void {
    this.isCalibrationMode = false;
    this.calibrationPoint = null;
    if (this.pdfContainer?.nativeElement) {
      this.pdfContainer.nativeElement.style.cursor = "default";
    }
    this.addAuditEntry("Mode calibration annulé");
    this.snackBar.open("Mode calibration annulé", "Fermer", { duration: 2000 });
  }

  resetCalibration(): void {
    this.calculatedOffsetX = 0;
    this.calculatedOffsetY = 0;
    this.referencePoints = [];
    if (this.signatureElement) {
      this.updateSignaturePdfCoordinates();
    }
    this.addAuditEntry("Calibration réinitialisée");
    this.snackBar.open("Calibration réinitialisée", "Fermer", { duration: 2000 });
  }

  getCalibrationStatus(): string {
    if (this.referencePoints.length === 0 && this.calculatedOffsetX === 0 && this.calculatedOffsetY === 0) {
      return "Non calibré";
    }
    return `Calibré (${this.referencePoints.length} points)`;
  }

  getCalibrationStatusColor(): string {
    if (this.referencePoints.length === 0 && this.calculatedOffsetX === 0 && this.calculatedOffsetY === 0) {
      return "#f44336";
    }
    return this.referencePoints.length > 0 ? "#4caf50" : "#ff9800";
  }

  private handleError(message: string, error?: any): void {
    console.error(message, error);
    this.addAuditEntry(message, error, true);
    
    const errorMessage = error instanceof Error ? `${message}: ${error.message}` : message;
    this.snackBar.open(errorMessage, "Fermer", {
      duration: 5000,
      panelClass: ["error-snackbar"],
    });
  }
}
