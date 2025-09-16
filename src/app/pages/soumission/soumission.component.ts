import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, interval, throwError, lastValueFrom } from 'rxjs';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

// Définition de l'interface pour les éléments du devis
export interface DevisItem {
  numero: number | null;
  designation: string;
  unite: string;
  quantite: number;
  pu_ht: number;
  pt_ht: number;
  [key: string]: any;
}

interface SoumissionForm {
  refAO: string;
  objetAO: string;
  dateLimite: string;
  nomEntreprise: string;
  adresse: string;
  telephone: string;
  email: string;
  compteBancaire: string;
  taxeProfessionnelle: string;
  ice: string;
  cnss: string;
  saveDraft: boolean;
  delaiExecution: number | null;
  acceptConditions: boolean;
  uploadedFiles: {
    registreCommerce: File | null;
    attestationFiscale: File | null;
    attestationCNSS: File | null;
    refProjets: File[];
    plans: File[];
    cvTech: File[];
    avis: File | null;
    declarationHonneur: File | null;
    fichierDevisRempli: File | null; // <-- Ajout de cette propriété ici
  };
}

interface DocumentAO {
  file_name: string;
  file_url: string;
  category: string;
}

@Component({
  selector: 'app-soumission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './soumission.component.html',
  styleUrls: ['./soumission.component.css'],
})
export class SoumissionComponent implements OnInit, OnDestroy {
  @ViewChild('soumissionForm') soumissionForm!: NgForm;
  soumissions: any[] = [];
  currentYear: number = new Date().getFullYear();
  documentsAO: any[] = [];
  documentsTechniques: any[] = [];
  documentsAdministratifs: any[] = [];

  form: SoumissionForm = {
    refAO: '',
    objetAO: '',
    dateLimite: '',
    nomEntreprise: '',
    adresse: '',
    telephone: '',
    email: '',
    compteBancaire: '',
    taxeProfessionnelle: '',
    ice: '',
    cnss: '',
    saveDraft: false,
    delaiExecution: null,
    acceptConditions: false,
    uploadedFiles: {
      registreCommerce: null,
      attestationFiscale: null,
      attestationCNSS: null,
      refProjets: [],
      plans: [],
      cvTech: [],
      avis: null,
      declarationHonneur: null,
      fichierDevisRempli: null, // <-- Ajout de cette propriété ici
    },
  };

  excelFiles: string[] = [];
  selectedFileName: string = '';
  devisData: DevisItem[] = [];
  columnDefs: string[] = [];

  qteColName: string = 'quantite';
  puhtColName: string = 'pu_ht';
  pthtColName: string = 'pt_ht';

  tvaRate: number = 0.2;
  totalHT: number = 0;
  tvaAmount: number = 0;
  totalTTC: number = 0;

  loading: boolean = false;
  message: string | null = null;
  messageType: 'success' | 'error' | 'info' | 'warning' = 'success';
  error: string | null = null;
  appelOffre: any = null;
  supabase: SupabaseClient;
  aoDetails: any = null;
  numeroAO: string | null = null;

  private aoId: string | null = null;
  private authSubscription: Subscription | undefined;
  private sessionCheckInterval: Subscription | undefined;
  private baseUrl = 'http://localhost:3000/api';
  private SUPABASE_BUCKET_DOCUMENTS = 'documents-uploads';
  private SUPABASE_BUCKET_EXCEL_SUBMISSIONS = 'excel-submissions';

  private debugExcelStructure(jsonData: any[]): void {
    console.log('=== DEBUG STRUCTURE EXCEL ===');
    console.log('Nombre total de lignes:', jsonData.length);

    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
        const row = jsonData[i];
        console.log(`Ligne ${i}:`, Array.isArray(row) ? row : [row]);
    }
    console.log('=== FIN DEBUG ===');
  }

  // Fonction améliorée pour trouver la ligne d'en-tête, plus robuste
 private findHeaderRow(jsonData: any[]): { headerRowIndex: number, headerMap: { [key: string]: string } } {
  const headerKeywords = {
    'n°': ['n°', 'num', 'numero'],
    'désignation': ['désignation', 'designation', 'description', 'libellé', 'item'],
    'unité': ['unité', 'unite', 'unit'],
    'quantité': ['quantité', 'quantite', 'quantity', 'qte', 'quant'],
    'p.u. (ht)': ['p.u.', 'pu', 'prix unitaire', 'prix_unitaire', 'pu/ht'],
    'p.t. (ht)': ['p.t.', 'pt', 'prix total', 'prix_total', 'pt/ht']
  };

  for (let i = 0; i < Math.min(30, jsonData.length); i++) {
    const row = jsonData[i];
    if (!row || typeof row !== 'object') continue;

    const rowKeys = Object.keys(row);
    const rowLower = rowKeys.map(key => String(row[key] || '').toLowerCase().trim().replace(/\s+/g, ' '));

    console.log(`🔍 Recherche en-têtes ligne ${i}:`, rowLower);
    
    let matches = 0;
    let headerMap: { [key: string]: string } = {};

    for (const targetKey in headerKeywords) {
      const matchingIndex = rowLower.findIndex(cell =>
        headerKeywords[targetKey as keyof typeof headerKeywords].some(keyword => cell.includes(keyword))
      );

      if (matchingIndex !== -1) {
        matches++;
        headerMap[targetKey] = rowKeys[matchingIndex];
      }
    }

    if (matches >= 4) {
      console.log('✅ En-têtes trouvés à la ligne', i, ':', headerMap);
      return { headerRowIndex: i, headerMap: headerMap };
    }
  }

  console.log('❌ Aucun pattern d\'en-tête reconnu');
  return { headerRowIndex: -1, headerMap: {} };
}

private getCellValue(row: any, headerMap: { [key: string]: string }, targetHeader: string): any {
    const key = headerMap[targetHeader];
    if (key && row[key] !== undefined) {
        return row[key];
    }
    return null;
}
  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    this.supabase = createClient(
      'https://kfzlkfupyrokfimekkee.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmemxrZnVweXJva2ZpbWVra2VlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM2OTE3MSwiZXhwIjoyMDY1OTQ1MTcxfQ.fJ3dH_-hehJ8fdOOJAIF3byDnP1E1ZDYu4mOFCn84iY'
    );
  }

  async ngOnInit(): Promise<void> {
    this.aoId = this.route.snapshot.paramMap.get('id');
    console.log('[DEBUG] ngOnInit called');

    if (this.aoId) {
      this.numeroAO = this.aoId;
      await this.fetchAoDetails(this.aoId);
      await this.fetchAoDocuments(this.aoId);
      await this.loadAoDetails(this.aoId);
      await this.loadDevisFromSupabase(this.aoId);
    }

    await this.checkUserSession();

    this.authSubscription = this.supabaseService.authEvents$.subscribe(
      async (event: AuthChangeEvent | null) => {
        if (event === 'SIGNED_OUT') {
          this.showMessage('Votre session a expiré ou vous avez été déconnecté.', 'error');
          this.router.navigate(['/auth']);
        }
      }
    );

    this.sessionCheckInterval = interval(5 * 60 * 1000).subscribe(async () => {
      console.log('[DEBUG] Vérification périodique de la session...');
      await this.checkUserSession();
    });
  }

  ngOnDestroy(): void {
    console.log('[DEBUG] ngOnDestroy called');
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.sessionCheckInterval) {
      this.sessionCheckInterval.unsubscribe();
    }
  }

  async fetchAoDetails(aoId: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('appels_offres')
        .select('*')
        .eq('numeroAO', aoId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur lors du chargement de l\'AO:', error);
        this.showMessage('Impossible de charger les informations de l\'appel d\'offres.', 'error');
      } else if (data) {
        console.log('✅ Détails de l\'AO chargés:', data);
        this.form.refAO = data.numeroAO;
        this.form.objetAO = data.objet;
        this.form.dateLimite = data.dateLimite;
        this.aoDetails = data;
      } else {
        console.warn('⚠️ Aucun appel d\'offres trouvé pour cet ID.');
        this.showMessage('Aucun appel d\'offres trouvé pour cet ID.', 'info');
      }
    } catch (err) {
      console.error('An unexpected error occurred:', err);
      this.showMessage('Une erreur inattendue est survenue.', 'error');
    } finally {
      this.loading = false;
    }
  }

 async loadDevisFromSupabase(aoId: string): Promise<void> {
  try {
    this.loading = true;
    this.showMessage('Recherche du devis Excel...', 'info');

    const { data: devisDocs, error } = await this.supabaseService.getClient()
      .from('documents')
      .select('file_url, file_name')
      .eq('numeroAO', aoId)
      .or('file_name.ilike.%.xlsx,file_name.ilike.%.xls')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      this.showMessage(`Erreur Supabase: ${error.message}`, 'error');
      return;
    }

    if (!devisDocs || devisDocs.length === 0 || !devisDocs[0].file_url) {
      this.showMessage('Aucun fichier Excel de devis trouvé pour cet AO.', 'info');
      return;
    }

    const devisDoc = devisDocs[0];
    const fileUrl = devisDoc.file_url;

    console.log(`[DEBUG] Tentative de chargement du fichier Excel depuis l'URL: ${fileUrl}`);

    const fileBlob = await lastValueFrom(
      this.http.get(fileUrl, { responseType: 'blob' }).pipe(
        catchError(err => throwError(() => new Error('Échec du téléchargement du fichier')))
      )
    );
    if (!fileBlob) {
      throw new Error('Le fichier téléchargé est vide.');
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      defval: ""
    });

    if (!jsonData || jsonData.length === 0) {
      this.showMessage('Le fichier Excel est vide ou les données n\'ont pas pu être traitées.', 'info');
      return;
    }

    console.log('📋 Données brutes Excel (premières 10 lignes):');
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      console.log(`Ligne ${i}:`, jsonData[i]);
    }

    const { headerRowIndex, headerMap } = this.findHeaderRow(jsonData);



    if (headerRowIndex === -1) {
      this.showMessage('Structure du fichier Excel non reconnue. Veuillez vérifier le format.', 'error');
      return;
    }

     this.devisData = [];
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any; 

      // Utilisez simplement la fonction getCellValue pour toutes les colonnes
      const designation = String(this.getCellValue(row, headerMap, 'désignation') || '').trim();
      console.log(`🔍 Traitement de la ligne ${i}: Désignation lue: "${designation}"`);


      // Vérifiez si la désignation est présente avant d'ajouter l'élément
      if (designation) {
          const item: DevisItem = {
              numero: this.parseNumericValue(this.getCellValue(row, headerMap, 'n°')),
              designation: designation,
              unite: String(this.getCellValue(row, headerMap, 'unité') || ''),
              quantite: this.parseNumericValue(this.getCellValue(row, headerMap, 'quantité') || this.getCellValue(row, headerMap, 'qte')),
              
              pu_ht: this.parseNumericValue(this.getCellValue(row, headerMap, 'p.u. (ht)')),
              pt_ht: this.parseNumericValue(this.getCellValue(row, headerMap, 'p.t. (ht)'))
          };
          this.devisData.push(item);
      }
  }
    

    console.log('✅ Données de devis parsées et prêtes à être affichées :', this.devisData);

    if (this.devisData.length === 0) {
      this.showMessage('Aucune ligne de devis valide n\'a été trouvée. Assurez-vous que la colonne "Désignation" est remplie.', 'info');
      this.devisData = [];
    } else {
      this.calculateTotals();
      this.showMessage('Devis chargé avec succès!', 'success');
    }

  } catch (err: any) {
    console.error('❌ Erreur lors du traitement du devis:', err);
    this.showMessage(`Erreur lors du chargement: ${err.message || 'Erreur inconnue'}`, 'error');
  } finally {
    this.loading = false;
  }
}

// Nouvelle méthode pour gérer l'extraction de la désignation de manière robuste
private getDesignation(row: any, headers: any): string {
  // Tentative de récupération des valeurs avec les en-têtes nettoyés
  const cleanedDesignationHeader = headers['désignation'];
  if (cleanedDesignationHeader && row[cleanedDesignationHeader]) {
    return String(row[cleanedDesignationHeader]).trim();
  }

  // Si l'en-tête n'est pas trouvé, on cherche des clés génériques
  // On peut faire cela de manière plus robuste en fonction de la structure
  // de l'objet row. Par exemple, si la désignation est souvent la deuxième clé
  const keys = Object.keys(row);
  const designationKey = keys.find(key => key.includes('__EMPTY') && !key.includes('__rowNum__') && String(row[key]).trim().length > 0);

  if (designationKey) {
    return String(row[designationKey]).trim();
  }

  return '';
}
  // Méthode pour remplir le formulaire avec les données du devis
  private populateFormWithDevis(devis: any): void {
    // Remplir les informations de base
    this.form.refAO = devis.ref_ao || devis.numero_ao || '';

    this.form.nomEntreprise = devis.nom_entreprise || '';
    this.form.adresse = devis.adresse || '';
    this.form.telephone = devis.telephone || '';
    this.form.email = devis.email || '';
    this.form.ice = devis.ice || '';
    this.form.cnss = devis.cnss || '';
    this.form.taxeProfessionnelle = devis.taxe_pro || '';
    this.form.compteBancaire = devis.compte_bancaire || '';
    this.form.delaiExecution = devis.delai_execution || null;

    if (devis.devis_data && Array.isArray(devis.devis_data)) {
      this.devisData = devis.devis_data;
      this.calculateTotals();
    }

    if (devis.total_ht) this.totalHT = devis.total_ht;
    if (devis.tva_amount) this.tvaAmount = devis.tva_amount;
    if (devis.total_ttc) this.totalTTC = devis.total_ttc;

    this.showMessage('Devis existant chargé avec succès', 'success');
  }

  async fetchAoDocuments(aoId: string): Promise<void> {
    try {
      console.log('🔍 Recherche des documents pour AO:', aoId);

      const { data, error } = await this.supabaseService.getClient()
        .from('documents')
        .select('file_name, file_url, category')
        .eq('numeroAO', aoId)
        .eq('stakeholder', 'fournisseur')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        return;
      }

      this.documentsAO = data || [];
      console.log('✅ Documents récupérés:', this.documentsAO);
    } catch (err) {
      console.error('💥 Erreur inattendue:', err);
    }
  }

  async loadAoDetails(aoId: string): Promise<void> {
    this.loading = true;
    this.message = null;
    this.error = null;

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('appels_offres')
        .select('*')
        .eq('numeroAO', aoId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur lors du chargement de l\'AO:', error);
        this.showMessage('Impossible de charger les informations de l\'appel d\'offres.', 'error');
      } else if (data) {
        console.log('✅ Détails de l\'AO chargés:', data);
        this.form.refAO = data.numeroAO;
        this.form.objetAO = data.objet;
        this.form.dateLimite = data.dateLimite;
        this.aoDetails = data;
      } else {
        console.warn('⚠️ Aucun appel d\'offres trouvé pour cet ID.');
        this.showMessage('Aucun appel d\'offres trouvé pour cet ID.', 'info');
      }
    } catch (err) {
      console.error('An unexpected error occurred:', err);
      this.showMessage('Une erreur inattendue est survenue.', 'error');
    } finally {
      this.loading = false;
    }
  }

  async loadAoData(aoId: string) {
    const { data, error } = await this.supabaseService.getClient().from('appels_offres').select('*').eq('numeroAO', aoId);
 
    if (data && data.length > 0) {
      const ao = data[0];
      this.form.refAO = ao.numeroAO;
      this.form.objetAO = ao.objet;
      this.form.dateLimite = ao.dateLimite;
    }
  }

  previewDocument(doc: any): void {
    const url = doc.url || doc.file_url;
    if (url) {
      window.open(url, '_blank');
    } else {
      this.showMessage('Impossible de prévisualiser ce document. URL non disponible.', 'error');
    }
  }

  downloadDocument(doc: any): void {
    const url = doc.url || doc.file_url;
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.showMessage('Téléchargement du document démarré.', 'info');
    } else {
      this.showMessage('Impossible de télécharger ce document. URL non disponible.', 'error');
    }
  }

  goToSoumission(aoId: string) {
    this.router.navigate(['/soumission', aoId]);
  }

  getAlreadySubmittedAoIds(userId: string): string[] {
    return [];
  }

  async checkUserSession(): Promise<void> {
    try {
      console.log('[DEBUG] checkUserSession: Calling supabase.auth.getUser()...');
      const { data: { user } = { user: null }, error: authError } = await this.supabaseService.getUser();
      console.log('[DEBUG] checkUserSession: supabase.auth.getUser() call completed.');

      if (authError) {
        console.error('[ERROR] checkUserSession: Error getting user from Supabase:', authError.message);
        this.showMessage(`Erreur d'authentification Supabase: ${authError.message}. Veuillez vous reconnecter.`, 'error');
        this.router.navigate(['/auth']);
        return;
      }

      if (!user) {
        console.warn('[DEBUG] checkUserSession: User not logged in, redirecting to authentication.');
        this.showMessage('Vous devez être connecté pour soumettre ce formulaire.', 'error');
        this.router.navigate(['/auth']);
      } else {
        console.log('[DEBUG] checkUserSession: User logged in:', user.email);
      }
    } catch (error: any) {
      console.error('[ERROR] checkUserSession: Erreur checking session:', error.message || error);
      this.showMessage('Erreur de session. Veuillez essayer de vous reconnecter.', 'error');
      this.router.navigate(['/auth']);
    }
  }

  async onSubmit(form: NgForm): Promise<void> {
    console.log('[DEBUG] Starting onSubmit');
    this.loading = true;
    this.message = 'Soumission en cours...';
    this.error = null;
console.log('[DEBUG] onSubmit: All preliminary checks passed. Proceeding with file uploads.');
    if (form.invalid) {
      console.warn('[DEBUG] Form is invalid (found by Angular).');
      this.showMessage('Veuillez corriger les erreurs dans le formulaire.', 'error');
      this.loading = false;
      this.message = 'Soumission en cours...';
      return;
    }
    console.log('Valeurs du formulaire avant envoi:', this.form);
   console.log('[DEBUG] Form is valid (Angular check passed).');
    const soumissionData = {
        numeroAO: this.form.refAO,
       objet: this.form.objetAO,
       dateLimite: this.form.dateLimite,
       uploadedFiles: JSON.stringify(this.form.uploadedFiles), // Convertir les fichiers en JSON
    devis_data: JSON.stringify(this.devisData),// ✅ AJOUTEZ CETTE LIGNE
    total_ht: this.totalHT,
    tva_amount: this.tvaAmount,
    total_ttc: this.totalTTC


    };
    console.log('Données à envoyer à la base de données:', soumissionData);
    console.log('Données finales à envoyer à Supabase:', soumissionData);
    
     const { data, error } = await this.supabaseService.getClient()
            .from('fournisseurs')
            .insert([soumissionData]);

    console.log('Objet de données à insérer:', soumissionData);
    console.log('Données envoyées:', soumissionData);

    form.control.markAllAsTouched();

    if (form.invalid) {
      console.warn('[DEBUG] Form is invalid (found by Angular).');
      this.showMessage('Veuillez corriger les erreurs dans le formulaire.', 'error');
      this.loading = false;
      return;
    }
    console.log('[DEBUG] Form is valid (Angular check passed).');

    if (!this.devisData || this.devisData.length === 0) {
      console.warn('[DEBUG] Devis data is empty.');
      this.showMessage('Veuillez charger les données du devis Excel avant de soumettre.', 'error');
      this.loading = false;
      return;
    }
    console.log(`[DEBUG] Devis data loaded. Number of items: ${this.devisData.length}.`);

    if (!this.form.acceptConditions) {
      console.warn('[DEBUG] Terms and conditions not accepted.');
      this.showMessage('Vous devez accepter les termes et conditions pour soumettre.', 'error');
      this.loading = false;
      return;
    }
    console.log('[DEBUG] Terms and conditions accepted.');

    try {
      console.log('[DEBUG] onSubmit: Checking user authentication...');
      const { data, error: authError } = await this.supabaseService.getUser();
      if (authError) {
        console.error('[ERROR] onSubmit: Error getting user from Supabase:', authError.message);
        this.showMessage(`Erreur d'authentification Supabase: ${authError.message}`, 'error');
        this.router.navigate(['/auth']);
        this.loading = false;
        return;
      }
         const documentsAdministratifsData: { name: string, url: string }[] = [];
      const documentsTechniquesData: { name: string, url: string }[] = [];
     
      const user = data?.user;
      console.log('[DEBUG] onSubmit: All preliminary checks passed. Proceeding with file uploads.');
      if (!user) {
        console.warn('[DEBUG] onSubmit: User not logged in (Supabase check returned no user).');
        this.showMessage('Vous devez être connecté pour soumettre ce formulaire.', 'error');
        this.router.navigate(['/auth']);
        this.loading = false;
        return;
      }
      console.log('[DEBUG] onSubmit: User authenticated:', user.email);

      console.log('[DEBUG] onSubmit: All preliminary checks passed. Proceeding with file uploads and FormData preparation.');
      const uploadedFilesData: { url: string, category: string, fileName: string }[] = [];
      const uploadedFileUrls: string[] = [];

      const sanitizedRefAO = this.form.refAO.replace(/[^a-zA-Z0-9_]+/g, '_').toLowerCase();
      if (!sanitizedRefAO) {
        this.showMessage('La référence AO est requise pour générer le chemin des fichiers.', 'error');
        this.loading = false;
        return;
      }
      const submissionUniqueId = `${sanitizedRefAO}-${Date.now()}`;
      console.log(`[DEBUG] onSubmit: ID unique de soumission généré: ${submissionUniqueId}`);

      
      const filesToUpload: { file: File, fieldName: string }[] = [];


     const singleFileFields = ['registreCommerce', 'attestationFiscale', 'attestationCNSS', 'avis', 'declarationHonneur'];
singleFileFields.forEach(fieldName => {
  const file = this.form.uploadedFiles[fieldName as keyof SoumissionForm['uploadedFiles']];
  if (file instanceof File) {
    filesToUpload.push({ file, fieldName });
  }
});

// Ajouter les champs de fichiers multiples à la liste
const multiFileFields = ['refProjets', 'plans', 'cvTech'];
multiFileFields.forEach(fieldName => {
  const files = this.form.uploadedFiles[fieldName as keyof SoumissionForm['uploadedFiles']];
  if (Array.isArray(files)) {
    files.forEach(file => {
      if (file instanceof File) {
        filesToUpload.push({ file, fieldName });
      }
    });
  }
});

// Exécuter la boucle de téléversement unique pour tous les fichiers
for (const fileItem of filesToUpload) {
  const { file, fieldName } = fileItem;
  const filePathInBucket = `${submissionUniqueId}/${fieldName}/${file.name}`;

  const { data: uploadData, error: uploadError } = await this.supabaseService.uploadFile(this.SUPABASE_BUCKET_DOCUMENTS, filePathInBucket, file);

  if (!uploadError && uploadData?.path) {
    const { data: { publicUrl } } = this.supabaseService.getPublicUrl(this.SUPABASE_BUCKET_DOCUMENTS, uploadData.path);
    if (publicUrl) {
      const documentData = { name: file.name, url: publicUrl };
      if (['registreCommerce', 'attestationFiscale', 'attestationCNSS', 'avis', 'declarationHonneur'].includes(fieldName)) {
        documentsAdministratifsData.push(documentData);
      } else if (['refProjets', 'plans', 'cvTech'].includes(fieldName)) {
        documentsTechniquesData.push(documentData);
      }
    }
  }
}


       for (const fileItem of filesToUpload) {
        const { file, fieldName } = fileItem;
        const filePathInBucket = `${submissionUniqueId}/${fieldName}/${file.name}`;
        
        console.log(`[DEBUG] Tentative d'upload pour le fichier: ${file.name} vers ${this.SUPABASE_BUCKET_DOCUMENTS}/${filePathInBucket}`);

        const { data: uploadData, error: uploadError } = await this.supabaseService.uploadFile(this.SUPABASE_BUCKET_DOCUMENTS, filePathInBucket, file);

        if (uploadError) {
          console.error(`[ERROR] Erreur lors du téléversement de ${file.name}:`, uploadError);
          this.showMessage(`Échec du téléversement du fichier ${file.name}: ${uploadError.message || 'Erreur inconnue'}`, 'error');
          continue;
        }

        if (uploadData?.path) {
          const { data: { publicUrl } } = this.supabaseService.getPublicUrl(this.SUPABASE_BUCKET_DOCUMENTS, uploadData.path);
          
          if (publicUrl) {
            const documentData = { name: file.name, url: publicUrl };
             if (publicUrl) {
        const documentData = { name: file.name, url: publicUrl };

        // Catégorisation des documents et ajout à un tableau
        if (['registreCommerce', 'attestationFiscale', 'attestationCNSS', 'avis', 'declarationHonneur'].includes(fieldName)) {
            documentsAdministratifsData.push(documentData);
        } else if (['refProjets', 'plans', 'cvTech'].includes(fieldName)) {
            documentsTechniquesData.push(documentData);
        }
    }

             
            // Catégorisation des documents
            if (['registreCommerce', 'attestationFiscale', 'attestationCNSS', 'avis', 'declarationHonneur'].includes(fieldName)) {
              documentsAdministratifsData.push(documentData);
            } else if (['refProjets', 'plans', 'cvTech'].includes(fieldName)) {
              documentsTechniquesData.push(documentData);
            }
          }
        }
      }

      console.log(`[DEBUG] onSubmit: Tous les uploads Supabase tentés. Documents administratifs obtenus: ${documentsAdministratifsData.length}. Documents techniques obtenus: ${documentsTechniquesData.length}.`);
      
      const requiredFilesUploaded = filesToUpload.length > 0;
      if (!requiredFilesUploaded) {
        this.showMessage('Aucun fichier requis n\'a pu être téléversé sur Supabase. Veuillez vérifier vos fichiers et la configuration du bucket.', 'error');
        this.loading = false;
        return;
      }

      if ((documentsAdministratifsData.length + documentsTechniquesData.length) === 0 && this.hasRequiredFiles()) {
        this.showMessage('Aucun fichier requis n\'a pu être téléversé sur Supabase. Veuillez vérifier vos fichiers et la configuration du bucket.', 'error');
        this.loading = false;
        return;
      }

 

      console.log('[DEBUG onSubmit] État de fichierDevisRempli avant l\'upload : ', this.form.uploadedFiles.fichierDevisRempli);
      console.log('[DEBUG onSubmit] fichierDevisRempli est une instance de File :', this.form.uploadedFiles.fichierDevisRempli instanceof File);

      if (this.form.uploadedFiles.fichierDevisRempli instanceof File) {
        const excelFilePathInBucket = `devis_remplir/${submissionUniqueId}/${this.form.uploadedFiles.fichierDevisRempli.name}`;
        console.log(`[DEBUG] Tentative d'upload pour le fichier Excel rempli: ${this.form.uploadedFiles.fichierDevisRempli.name} vers ${this.SUPABASE_BUCKET_EXCEL_SUBMISSIONS}/${excelFilePathInBucket}`);
        const { data: uploadData, error: uploadError } = await this.supabaseService.uploadFile(this.SUPABASE_BUCKET_EXCEL_SUBMISSIONS, excelFilePathInBucket, this.form.uploadedFiles.fichierDevisRempli);
        if (uploadError) {
          console.error(`[ERROR] Erreur lors du téléversement du fichier Excel rempli:`, uploadError);
          this.showMessage(`Échec du téléversement du fichier Excel rempli: ${uploadError.message || 'Erreur inconnue'}`, 'error');
        } else if (uploadData?.path) {
          const { data: { publicUrl } } = this.supabaseService.getPublicUrl(this.SUPABASE_BUCKET_EXCEL_SUBMISSIONS, uploadData.path);
          if (publicUrl) {
            uploadedFileUrls.push(publicUrl);
            console.log(`[DEBUG] onSubmit: Ajout URL publique pour le fichier Excel rempli: ${publicUrl}`);
          }
        }
      } else {
        console.warn('[DEBUG onSubmit] fichierDevisRempli n\'est PAS un objet File ou est null/undefined. Pas d\'upload Excel.');
      }

      console.log(`[DEBUG] onSubmit: Tous les uploads Supabase tentés. URLs obtenues: ${uploadedFileUrls.length}`);

      if (uploadedFileUrls.length === 0 && this.hasRequiredFiles()) {
        this.showMessage('Aucun fichier requis n\'a pu être téléversé sur Supabase. Veuillez vérifier vos fichiers et la configuration du bucket.', 'error');
        this.loading = false;
        return;
      }

      const submissionBody = {
        aoId: this.aoId,
        refAO: this.form.refAO,
        objetAO: this.form.objetAO,
        dateLimite: this.form.dateLimite,
        nomEntreprise: this.form.nomEntreprise,
        adresse: this.form.adresse,
        telephone: this.form.telephone,
        email: this.form.email,
        compteBancaire: this.form.compteBancaire,
        taxeProfessionnelle: this.form.taxeProfessionnelle,
        ice: this.form.ice,
        cnss: this.form.cnss,
        saveDraft: this.form.saveDraft,
        delaiExecution: this.form.delaiExecution,
        acceptConditions: this.form.acceptConditions,
        devisData: this.devisData,
        totalHT: this.totalHT,
        tvaAmount: this.tvaAmount,
        totalTTC: this.totalTTC,
        selectedExcelTemplatePath: this.selectedFileName,
        documents_techniques: documentsTechniquesData,
        documents_administratifs: documentsAdministratifsData,
        userId: user.id,
        userEmail: user.email
      };

      console.log('[DEBUG] onSubmit: Sending submission data (with file URLs) to backend...', submissionBody);
      const response = await lastValueFrom(
        this.http.post(`${this.baseUrl}/soumission`, submissionBody).pipe(
          catchError(err => throwError(() => new Error(err.message || 'Erreur lors de la soumission')))
        )
      );
      console.log('[DEBUG] onSubmit: Backend responded!');
      console.log('[DEBUG] Documents administratifs à envoyer:', documentsAdministratifsData);
     console.log('[DEBUG] Documents techniques à envoyer:', documentsTechniquesData);

      console.log('[DEBUG] onSubmit: Submission successful:', response);
      this.showMessage('Votre soumission a été enregistrée avec succès !', 'success');
      this.resetForm(form);
    } catch (error: any) {
      console.error('[ERROR] onSubmit: Erreur lors de la soumission du formulaire:', error);
      let errorMessage = 'Erreur lors de la soumission du formulaire.';
      if (error instanceof HttpErrorResponse) {
        errorMessage = `Erreur HTTP: ${error.status} ${error.statusText}. `;
        if (error.error && error.error.message) {
          errorMessage += error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage += error.error;
        }
      } else if (error.message) {
        errorMessage += error.message;
      }
      this.showMessage(errorMessage, 'error');
    } finally {
      console.log('[DEBUG] onSubmit: End of onSubmit. Hiding spinner.');
      this.loading = false;
    }
  }

  private hasRequiredFiles(): boolean {
    const formControls = this.soumissionForm.controls;
    return (formControls['registreCommerce']?.hasError('required') && this.form.uploadedFiles.registreCommerce === null) ||
           (formControls['attestationFiscale']?.hasError('required') && this.form.uploadedFiles.attestationFiscale === null) ||
           (formControls['attestationCNSS']?.hasError('required') && this.form.uploadedFiles.attestationCNSS === null);
  }

  onCellChange(index: number, newValue: number): void {
    const item = this.devisData[index];
    item.pu_ht = this.parseNumericValue(newValue);
    item.pt_ht = item.quantite * item.pu_ht;
    this.calculateTotals();
  }

  calculateTotals(): void {
    if (this.devisData && this.devisData.length > 0) {
      this.totalHT = this.devisData.reduce((sum, item) => sum + (item.pt_ht || 0), 0);
      this.tvaAmount = this.totalHT * this.tvaRate;
      this.totalTTC = this.totalHT + this.tvaAmount;
      console.log('[DEBUG] Totaux recalculés:', { ht: this.totalHT, tva: this.tvaAmount, ttc: this.totalTTC });
    }
  }

  parseNumericValue(value: any): number {
    const parsed = parseFloat(String(value).replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }

  showMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = null;
    }, 5000);
  }

  resetForm(form: NgForm): void {
    form.resetForm();
    this.form = {
      refAO: '',
      objetAO: '',
      dateLimite: '',
      nomEntreprise: '',
      adresse: '',
      telephone: '',
      email: '',
      compteBancaire: '',
      taxeProfessionnelle: '',
      ice: '',
      cnss: '',
      saveDraft: false,
      delaiExecution: null,
      acceptConditions: false,
      uploadedFiles: {
        registreCommerce: null,
        attestationFiscale: null,
        attestationCNSS: null,
        refProjets: [],
        plans: [],
        cvTech: [],
        avis: null,
        declarationHonneur: null,
        fichierDevisRempli: null,
      },
    };
    this.devisData = [];
    this.totalHT = 0;
    this.tvaAmount = 0;
    this.totalTTC = 0;
    this.message = null;
  }

  onFileSelected(event: Event, field: keyof SoumissionForm['uploadedFiles']): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.form.uploadedFiles[field] = file as any; // Cast en "any" pour éviter les erreurs de type complexes
    }
  }

  onMultiFileSelected(event: Event, field: 'refProjets' | 'plans' | 'cvTech'): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.form.uploadedFiles[field] = Array.from(input.files);
    }
  }
}
