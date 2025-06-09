// src/app/pages/soumission/soumission.component.ts

import { Component, OnInit } from '@angular/core';
import { ColDef, CellValueChangedEvent, ValueParserParams } from 'ag-grid-community';
import { Location } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import * as XLSX from 'xlsx';

// --- Importation du service IndexedDB local ---
import { LocalDbService } from '../../service/local-db.service'; 

// Type pour les données Excel stockées (tableau de tableaux)
type StoredExcelData = any[][];

@Component({
  selector: 'app-soumission',
  templateUrl: './soumission.component.html',
  styleUrls: ['./soumission.component.css'],
  standalone: true,
  imports: [CommonModule, AgGridModule, FormsModule]
})
export class SoumissionComponent implements OnInit {
  // --- Propriétés AG-Grid ---
  columnDefs: ColDef[] = [];
  rowData: any[] = [];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: true
  };

  // --- Propriétés pour la gestion du chargement et des messages ---
  loading: boolean = false;
  errorMessage: string | null = null;

  // --- Propriétés pour la gestion des messages modaux ---
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'success';

  // --- Propriétés pour la liaison du formulaire HTML (ngModel) ---
  formData: any = {
    refAO: '', objetAO: '', dateLimite: '', adresse: '', telephone: '',
    email: '', compteBancaire: '', taxePro: '', ice: '', cnss: '',
    saveDraft: false, delaiExecution: '', acceptConditions: false,
    uploadedFiles: {
      refProjets: [], descriptifsTech: [], plans: [], cvTech: [],
      registreCommerce: null, attestationCNSS: null
    }
  };

  // --- Clé pour récupérer le devis dans IndexedDB ---
  private devisDataKey: string = 'devisData'; 

  // Injection du LocalDbService
  constructor(private location: Location, private localDbService: LocalDbService) {
    // Aucune initialisation Firebase nécessaire ici
  }

  ngOnInit(): void {
    // AJOUTEZ CETTE LIGNE :
    console.log("🚀 [Soumission] SoumissionComponent initialisé."); 
    // Aucune logique de chargement automatique ici, on attend le clic sur "Remplir le devis"
  }

  /**
   * Convertit la valeur saisie en nombre, retourne 0 si invalide.
   * Utilisé par AG-Grid pour les colonnes numériques.
   */
  numberParser(params: ValueParserParams): number {
    const parsed = Number(params.newValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Gère les changements de valeur dans les cellules AG-Grid.
   * Déclenche la mise à jour des totaux si nécessaire.
   */
  onCellValueChanged(event: CellValueChangedEvent): void {
    console.log('AG-Grid: cellValueChangedEvent', event);
    if (event.colDef.field === 'quantite' || event.colDef.field === 'prixUnitaire') {
      const rowNode = event.api.getRowNode(event.node.id!);
      if (rowNode) {
        const q = Number(rowNode.data.quantite) || 0;
        const p = Number(rowNode.data.prixUnitaire) || 0;
        rowNode.setDataValue('total', q * p);
      }
    }
    if (this.formData.saveDraft) {
      this.saveEditedData();
    }
  }

  /**
   * Charge les données du devis depuis IndexedDB et les affiche dans le tableau AG-Grid.
   * Cette fonction est appelée lorsque l'utilisateur clique sur "Remplir le devis".
   */
  async loadExcelData(): Promise<void> {
    console.log("➡️ [Soumission] 1. Fonction loadExcelData() appelée.");
    this.loading = true;
    this.errorMessage = null;
    this.columnDefs = [];
    this.rowData = [];

    this.openModal('info', 'Chargement du devis', 'Veuillez patienter pendant le chargement du devis localement.');

    try {
      console.log(`➡️ [Soumission] 2. Tentative de récupération des données Excel depuis IndexedDB avec la clé: "${this.devisDataKey}"`);
      const storedData: StoredExcelData | null = await this.localDbService.getExcelData(this.devisDataKey);
      console.log("➡️ [Soumission] 3. Données brutes récupérées d'IndexedDB:", storedData);

      if (storedData && Array.isArray(storedData) && storedData.length > 0) {
        console.log("➡️ [Soumission] 4. Données trouvées dans IndexedDB. Détermination des en-têtes et des lignes de données.");

        // IMPORTANT : Ajuster l'index de la ligne d'en-tête et des données
        // D'après votre structure, les en-têtes sont à l'index 4
        const headerRowIndex = 4;
        const dataStartRowIndex = 5;
        // On arrête avant les lignes de totaux et de résumé (à partir de l'index 19)
        const dataEndRowIndex = 18; 

        if (storedData.length <= headerRowIndex) {
            throw new Error("La structure du fichier Excel ne contient pas suffisamment de lignes pour les en-têtes.");
        }

        const excelHeaders: string[] = storedData[headerRowIndex];
        // Filtrer les lignes vides et les lignes de résumé/totaux
        const excelRows: any[][] = storedData.slice(dataStartRowIndex, dataEndRowIndex + 1)
            .filter(row => row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''));


        console.log("➡️ [Soumission] 5. En-têtes Excel extraits:", excelHeaders);
        console.log("➡️ [Soumission] 6. Lignes Excel extraites (de", dataStartRowIndex, "à", dataEndRowIndex, ", premières 5):", excelRows.slice(0, 5));

        // Générer les columnDefs pour AG-Grid à partir des en-têtes Excel
        this.columnDefs = excelHeaders.map((header: string, index: number) => {
          // Nettoie le nom de l'en-tête pour l'utiliser comme 'field' (identifiant unique pour la colonne)
          // Supprime les caractères non alphanumériques et met en minuscules
          const fieldName = header.trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
          let colDef: ColDef = {
            field: fieldName || `col${index}`, // Fallback si le header est vide après nettoyage
            headerName: header,
            editable: true
          };

          // Adapter des types spécifiques et des valueGetter/valueFormatter pour les colonnes connues
          // Basé sur les en-têtes nettoyés ou les en-têtes originaux si la détection est plus fiable
          if (header.includes('Quantité') || header.includes('QTE')) {
            colDef.type = 'numericColumn';
            colDef.valueParser = this.numberParser.bind(this);
          } else if (header.includes('PRIX UNITAIRE') || header.includes('PRIX UNITAIRE EN HT')) {
            colDef.type = 'numericColumn';
            colDef.valueParser = this.numberParser.bind(this);
          } else if (header.includes('TOTAL') || header.includes('PRIX TOTAL EN HT')) {
            colDef.editable = false; // La colonne Total n'est pas éditable directement
            colDef.valueGetter = (params) => {
                const quantiteHeaderIndex = excelHeaders.findIndex(h => h.includes('Quantité') || h.includes('QTE'));
                const prixUnitaireHeaderIndex = excelHeaders.findIndex(h => h.includes('PRIX UNITAIRE') || h.includes('PRIX UNITAIRE EN HT'));

                const qField = quantiteHeaderIndex !== -1 ? excelHeaders[quantiteHeaderIndex].trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() : '';
                const pUField = prixUnitaireHeaderIndex !== -1 ? excelHeaders[prixUnitaireHeaderIndex].trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() : '';

                const q = Number(params.data[qField]) || 0;
                const p = Number(params.data[pUField]) || 0;
                return q * p;
            };
            colDef.valueFormatter = params => (params.value !== undefined && params.value !== null ? Number(params.value).toFixed(2) : '0.00');
          }
          return colDef;
        }).filter(col => (col.headerName ?? '').trim() !== ''); // Filtrer les colonnes avec des en-têtes vides

        console.log("➡️ [Soumission] 7. columnDefs générés:", this.columnDefs);

        // Mapper les lignes Excel vers le format objet attendu par rowData d'AG-Grid
        this.rowData = excelRows.map(row => {
          const obj: { [key: string]: any } = {};
          excelHeaders.forEach((header, index) => {
            const fieldName = header.trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
            obj[fieldName] = row[index] !== undefined ? row[index] : ''; 
          });
          return obj;
        });
        console.log("➡️ [Soumission] 8. rowData générés (premières 5 lignes):", this.rowData.slice(0, 5));

        this.closeModal();
        this.openModal('success', 'Devis chargé', 'Le devis a été chargé avec succès depuis le stockage local.');
        console.log("✅ [Soumission] 9. Devis chargé et affiché avec succès.");
      } else {
        console.log("➡️ [Soumission] 4. Aucune donnée de devis trouvée dans IndexedDB ou les données sont vides/invalides.");
        this.openModal('warning', 'Aucun devis', 'Aucun devis n\'a été trouvé dans le stockage local. Veuillez d\'abord téléverser un fichier Excel via la page "Centraliser Document".');
      }
    } catch (err: any) {
      console.error("❌ [Soumission] 10. Erreur lors du chargement des données Excel depuis IndexedDB:", err);
      this.errorMessage = err.message || "Impossible de charger le devis depuis le stockage local. Vérifiez la console pour plus de détails.";
      this.closeModal();
      this.openModal('error', 'Erreur de chargement', this.errorMessage ?? 'Une erreur inconnue est survenue.');
    } finally {
      this.loading = false;
      console.log("➡️ [Soumission] 11. Fin de loadExcelData().");
    }
  }

  /**
   * Permet de télécharger le contenu actuel du tableau AG-Grid sous forme de fichier Excel.
   * Les modifications effectuées par l'utilisateur dans le tableau seront incluses.
   */
  telechargerDevis(): void {
    if (!this.rowData.length || !this.columnDefs.length) {
      this.openModal('warning', 'Aucun devis', 'Aucun devis n\'est affiché pour être téléchargé.');
      return;
    }

    const headers = this.columnDefs.map(col => col.headerName ?? col.field ?? ''); 
    const dataToExport = this.rowData.map(row => {
      return this.columnDefs.map(col => {
        if (col.field) {
          return row[col.field];
        }
        return '';
      });
    });

    const feuille: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, ...dataToExport]);
    const classeur: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(classeur, feuille, 'Devis Soumission');

    const dateStr = new Date().toISOString().split('T')[0];
    const nomFichier = `devis-soumission-${dateStr}.xlsx`;

    try {
      XLSX.writeFile(classeur, nomFichier);
      this.openModal('success', 'Téléchargement réussi', `Le fichier "${nomFichier}" a été téléchargé avec succès.`);
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement du devis :', error);
      this.openModal('error', 'Erreur de téléchargement', 'Impossible de télécharger le devis. Veuillez réessayer.');
    }
  }

  /**
   * Gère la sélection des fichiers pour les documents à joindre.
   * Ces fichiers ne seront pas persistés sans backend.
   */
  onFileSelect(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      this.openModal('warning', 'Aucun fichier', 'Aucun fichier sélectionné pour le champ ' + fieldName + '.');
      return;
    }

    const file = files[0];
    const fileUrl = URL.createObjectURL(file);

    const newFile = { nom: file.name, url: fileUrl };

    if (['registreCommerce', 'attestationCNSS'].includes(fieldName)) {
      this.formData.uploadedFiles[fieldName] = newFile.url;
    } else {
      if (!this.formData.uploadedFiles[fieldName]) {
        this.formData.uploadedFiles[fieldName] = [];
      }
      if (!this.formData.uploadedFiles[fieldName].some((f: any) => f === newFile.url)) {
         this.formData.uploadedFiles[fieldName].push(newFile.url);
      }
    }
    this.openModal('info', 'Fichier sélectionné', `Le fichier "${file.name}" a été sélectionné pour ${fieldName}. Note: Sans backend, il ne sera pas persisté. `);
    input.value = '';
  }


  /**
   * Enregistre les données éditées du tableau dans IndexedDB.
   */
  async saveEditedData(): Promise<void> {
    if (!this.rowData.length || !this.columnDefs.length) {
      this.openModal('warning', 'Rien à sauvegarder', 'Aucune donnée de devis à sauvegarder.');
      return;
    }

    // Préparer les données pour la sauvegarde : en-têtes et lignes.
    // Il faut reconstruire le format "tableau de tableaux" attendu par IndexedDB
    // en incluant les en-têtes comme première ligne.
    const headers = this.columnDefs.map(col => col.headerName ?? col.field ?? '');
    const dataRows = this.rowData.map(row => {
      const orderedRow: any[] = [];
      this.columnDefs.forEach(col => {
        if (col.field) {
          orderedRow.push(row[col.field]);
        }
      });
      return orderedRow;
    });

    const dataToSave = [headers, ...dataRows];


    try {
      await this.localDbService.saveExcelData(this.devisDataKey, dataToSave);
      this.openModal('success', 'Sauvegarde réussie', 'Les modifications du tableau ont été sauvegardées localement.');
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données du tableau dans IndexedDB:", error);
      this.openModal('error', 'Erreur de sauvegarde', 'Impossible de sauvegarder les modifications du tableau localement.');
    }
  }

  /**
   * Gère la soumission finale de l'ensemble du formulaire.
   * Note: Sans backend, cette soumission est purement client-side.
   * @param form L'objet NgForm qui représente l'état du formulaire HTML.
   */
  soumettreFormulaire(form: NgForm): void {
    if (form.valid) {
      console.log("Données du formulaire à soumettre:", this.formData);
      console.log("Données du devis (rowData):", this.rowData);
      this.openModal('success', 'Soumission envoyée', 'Votre soumission a été envoyée avec succès (simulation locale).');
      // this.reinitialiserFormulaire(form); // Optionnel: Réinitialiser après soumission
    } else {
      this.openModal('error', 'Formulaire incomplet', 'Veuillez remplir tous les champs obligatoires du formulaire.');
      form.control.markAllAsTouched();
    }
  }

  /**
   * Réinitialise l'ensemble du formulaire et les données du tableau de devis.
   * @param form L'objet NgForm à réinitialiser.
   */
  reinitialiserFormulaire(form: NgForm): void {
    if (!form) return;
    form.resetForm();
    this.rowData = [];
    this.columnDefs = [];
    this.formData.uploadedFiles = {
      refProjets: [], descriptifsTech: [], plans: [], cvTech: [],
      registreCommerce: null, attestationCNSS: null
    };
    // Supprimer les données du devis d'IndexedDB lors de la réinitialisation complète
    this.localDbService.deleteExcelData(this.devisDataKey);
    this.openModal('info', 'Formulaire réinitialisé', 'Le formulaire et le tableau de devis ont été réinitialisés.');
  }

  /**
   * Fonction de retour en arrière dans l'historique du navigateur.
   */
  goBack(): void {
    this.location.back();
  }

  // --- Fonctions utilitaires pour la gestion du modal ---
  openModal(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string): void {
    this.modalType = type;
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.modalTitle = '';
    this.modalMessage = '';
  }

  // --- Gestion du brouillon (maintenant lié à IndexedDB) ---
  onSaveDraftToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      console.log('Sauvegarde automatique de brouillon activée (vers IndexedDB).');
      this.openModal('info', 'Brouillon', 'La sauvegarde automatique du brouillon est activée (les modifications du tableau seront sauvegardées localement).');
      this.saveEditedData(); // Sauvegarde immédiate quand activé
    } else {
      console.log('Sauvegarde automatique désactivée.');
      this.openModal('info', 'Brouillon', 'La sauvegarde automatique du brouillon est désactivée.');
    }
  }
}
  







































