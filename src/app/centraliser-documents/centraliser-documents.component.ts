// src/app/centraliser-documents/centraliser-documents.component.ts

import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

// --- Importation du service IndexedDB local ---
import { LocalDbService } from '../service/local-db.service'; 

// jQuery pour DataTables (déclarer si non typé globalement)
declare var $: any;

@Component({
  selector: 'app-centraliser-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centraliser-documents.component.html',
  styleUrls: ['./centraliser-documents.component.css'],
})
export class CentraliserDocumentsComponent implements OnInit, AfterViewInit {
  // Propriétés pour la gestion des messages modaux (similaire à SoumissionComponent)
  showModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'success' | 'error' | 'warning' | 'info' = 'success';

  // Fichiers non-Excel (pour affichage temporaire, pas de persistance sans backend)
  fichiersFournisseurs: { nom: string; url: string }[] = [];
  fichiersMaitreOuvrage: { nom: string; url: string }[] = [];

  // Données du tableau Excel affiché localement sur cette page (pour DataTables)
  // tableauDevis contiendra l'ensemble des données, y compris la ligne d'en-tête
  tableauDevis: string[][] = [];
  afficherTableau = false; // Contrôle l'affichage du tableau
  // 'data' et 'merges' sont encore utilisés par le template pour les cellules fusionnées
  data: any[][] = []; 
  merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];

  // Références aux éléments input de type file dans le HTML
  @ViewChild('fileFournisseurInput') fileFournisseurInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileMaitreOuvrageInput') fileMaitreOuvrageInput!: ElementRef<HTMLInputElement>;

  // Clé pour le devis dans IndexedDB
  private devisDataKey: string = 'devisData';

  // Injection du LocalDbService
  constructor(private localDbService: LocalDbService) {
    // Le DocumentService est supprimé car nous n'utilisons plus Firebase/backend pour l'upload
  }

  ngOnInit(): void {
    // Charger le devis depuis IndexedDB lors de l'initialisation du composant
    this.chargerDevisDepuisIndexedDb();
  }

  ngAfterViewInit(): void {
    // initialiserDataTable est appelé à la fin de chargerDevisDepuisIndexedDb
    // pour s'assurer que les données sont prêtes.
    // L'appel ici peut être redondant mais sert de fallback si ngOnInit est trop rapide
    // ou si les données ne sont pas chargées de manière asynchrone au démarrage.
    if (this.afficherTableau) {
        this.initialiserDataTable();
    }
  }

  /**
   * Charge les données du devis stockées dans IndexedDB et les affiche dans le tableau.
   */
  private async chargerDevisDepuisIndexedDb(): Promise<void> {
    try {
      const savedData = await this.localDbService.getExcelData(this.devisDataKey);
      if (savedData && Array.isArray(savedData) && savedData.length > 0) {
        this.tableauDevis = savedData;
        this.data = savedData; // Pour les cellules fusionnées dans le template
        this.afficherTableau = true;
        // Appeler initialiserDataTable *après* que les données soient chargées
        this.initialiserDataTable(); 
      } else {
        this.afficherTableau = false;
      }
    } catch (error) {
      console.error('❌ Erreur de lecture du devis depuis IndexedDB :', error);
      this.openModal('error', 'Erreur de lecture', 'Impossible de lire les données du devis sauvegardé localement.');
      this.afficherTableau = false;
    }
  }

  /**
   * Initialise ou réinitialise le tableau DataTables avec les données du devis.
   */
  initialiserDataTable(): void {
    const tableId = '#monTableau';

    // Détruit l'instance existante de DataTables si elle existe
    if ($.fn.DataTable.isDataTable(tableId)) {
      $(tableId).DataTable().clear().destroy();
    }

    // N'initialise DataTables que si des données et des en-têtes sont présentes
    if (this.tableauDevis.length > 0 && this.tableauDevis[0].length > 0) {
        const headers = this.tableauDevis[0]; // La première ligne est les en-têtes
        const rowData = this.tableauDevis.slice(1); // Les lignes de données réelles

        // Créer les définitions de colonnes pour DataTables
        const columns = headers.map((header: string, index: number) => {
            return { title: header, data: index }; // 'data: index' mappe la colonne à l'indice du tableau de la ligne
        });

        setTimeout(() => {
            if ($(tableId).length) { // S'assure que l'élément DOM est là
                $(tableId).DataTable({
                    paging: true,
                    searching: true,
                    ordering: true,
                    info: true,
                    responsive: true,
                    columns: columns, // Définition explicite des colonnes
                    data: rowData,    // Fournit les données des lignes
                    // Permet à DataTables de fonctionner avec le rendu HTML des cellules fusionnées si nécessaire
                    // Tout en assurant que DataTables gère ses propres données
                    // Note: Les cellules fusionnées complexes avec DataTables peuvent nécessiter des plugins ou une logique plus avancée
                    // mais pour l'affichage de base, ceci devrait aider avec le warning.
                    retrieve: true // Permet de réutiliser le tableau si déjà initialisé (mais nous le détruisons avant)
                });
            }
        }, 0);
    } else {
        console.warn("DataTables: Aucune donnée ou en-tête disponible pour l'initialisation.");
    }
  }

  /**
   * Gère le changement de fichier pour tous les inputs de type file.
   * Parse les fichiers Excel et les stocke dans IndexedDB.
   * Pour les autres types de fichiers, signale simplement leur sélection.
   * @param event L'événement de changement du fichier.
   * @param type Optionnel, le type de fichier (ex: 'fournisseur', 'maitreOuvrage' ou null si c'est un devis direct).
   */
  onFileChange(event: Event, type?: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.openModal('warning', 'Aucun fichier', `Aucun fichier sélectionné pour ${type ?? 'ce champ'}.`);
      return;
    }

    const file = input.files[0];
    const ext = file.name.toLowerCase().split('.').pop();
    const isExcelFile = ext && ['xlsx', 'xls', 'csv'].includes(ext);

    if (isExcelFile) {
      // Traitement des fichiers Excel
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convertir la feuille en JSON, en incluant les en-têtes comme première ligne
          const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

          // Filtrer les lignes et colonnes vides
          const filteredData = jsonData
            .filter(row => row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''))
            .map(row => row.map(cell => (String(cell ?? '').trim())));

          this.tableauDevis = filteredData;
          this.data = filteredData; // Pour les cellules fusionnées dans le template
          this.merges = worksheet['!merges'] || []; // Gérer les cellules fusionnées

          this.afficherTableau = this.tableauDevis.length > 0;

          // Sauvegarder les données parsées dans IndexedDB
          await this.localDbService.saveExcelData(this.devisDataKey, filteredData);
          this.openModal('success', 'Fichier Excel chargé', `Le fichier Excel "${file.name}" a été lu et sauvegardé localement.`);

          this.initialiserDataTable(); // Réinitialiser DataTables avec les nouvelles données

        } catch (error) {
          console.error('❌ Erreur de lecture/parsing Excel :', error);
          this.openModal('error', 'Erreur Excel', 'Erreur lors de la lecture ou du traitement du fichier Excel.');
        } finally {
          input.value = ''; // Réinitialiser l'input file pour permettre une nouvelle sélection
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Traitement des autres types de fichiers (PDF, images, DOCX)
      // Sans backend, nous ne pouvons pas les stocker durablement.
      // On les ajoute à une liste temporaire (pour l'affichage immédiat)
      const fileUrl = URL.createObjectURL(file); // Crée une URL temporaire pour l'affichage
      const newFile = { nom: file.name, url: fileUrl };

      if (type === 'fournisseur') {
        this.fichiersFournisseurs.push(newFile);
      } else if (type === 'maitreOuvrage') {
        this.fichiersMaitreOuvrage.push(newFile);
      }
      this.openModal('info', 'Fichier sélectionné', `Le fichier "${file.name}" a été sélectionné. Note: Sans backend, il ne sera pas persisté.`);
      input.value = ''; // Réinitialiser l'input file
    }
  }

  /**
   * Met à jour une cellule spécifique dans le tableau de devis et la sauvegarde dans IndexedDB.
   * @param row Index de la ligne.
   * @param col Index de la colonne.
   * @param value Nouvelle valeur de la cellule.
   */
  async updateCell(row: number, col: number, value: string): Promise<void> {
    if (!this.tableauDevis[row]) {
      this.tableauDevis[row] = [];
    }
    this.tableauDevis[row][col] = value;
    // Sauvegarder la modification dans IndexedDB
    try {
      await this.localDbService.saveExcelData(this.devisDataKey, this.tableauDevis);
      console.log('Modification de cellule sauvegardée dans IndexedDB.');
    } catch (error) {
      console.error('Erreur de sauvegarde de cellule dans IndexedDB :', error);
      this.openModal('error', 'Erreur de sauvegarde', 'Impossible de sauvegarder la modification de la cellule.');
    }
  }

  /**
   * Gère la mise à jour d'une cellule à partir d'un événement HTML (par ex. input blur).
   * @param event L'événement déclencheur.
   * @param rowIndex Index de la ligne.
   * @param colIndex Index de la colonne.
   */
  updateCellFromEvent(event: Event, rowIndex: number, colIndex: number): void {
    const target = event.target as HTMLElement;
    const text = target.textContent?.trim() ?? '';
    this.updateCell(rowIndex, colIndex, text);
  }


  // Fonctions pour gérer les cellules fusionnées (issues de votre code original)
  isCellHidden(r: number, c: number): boolean {
    for (const merge of this.merges) {
      const start = merge.s;
      const end = merge.e;
      if (
        r >= start.r &&
        r <= end.r &&
        c >= start.c &&
        c <= end.c &&
        !(r === start.r && c === start.c)
      ) {
        return true;
      }
    }
    return false;
  }

  getSpan(r: number, c: number): { rowspan: number; colspan: number } {
    for (const merge of this.merges) {
      const start = merge.s;
      const end = merge.e;
      if (r === start.r && c === start.c) {
        return {
          rowspan: end.r - start.r + 1,
          colspan: end.c - start.c + 1,
        };
      }
    }
    return { rowspan: 1, colspan: 1 };
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
}






