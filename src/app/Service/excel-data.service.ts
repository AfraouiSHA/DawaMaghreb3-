import { Injectable } from '@angular/core'; 
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelDataService {
  private readonly storageKey = 'tableauDevis';
  private tableauDevis: any[][] = [];
  private tableauSubject = new BehaviorSubject<any[][]>([]);

  // Ajout HttpClient dans le constructeur pour faire des requêtes HTTP
  constructor(private http: HttpClient) {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.tableauDevis = parsed;
          this.tableauSubject.next(this.tableauDevis);
        }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du tableauDevis :', error);
      this.tableauDevis = [];
    }
  }

  getTableauDevis(): Observable<any[][]> {
    return this.tableauSubject.asObservable();
  }

  setTableauDevis(data: any[][]): void {
    this.tableauDevis = data;
    this.saveToLocalStorage();
    this.tableauSubject.next(this.tableauDevis);
  }

  updateCell(rowIndex: number, colIndex: number, value: any): void {
    if (
      this.tableauDevis[rowIndex] &&
      this.tableauDevis[rowIndex][colIndex] !== undefined
    ) {
      this.tableauDevis[rowIndex][colIndex] = value;
      this.saveToLocalStorage();
      this.tableauSubject.next(this.tableauDevis);
    }
  }

  resetTableauDevis(): void {
    this.tableauDevis = [];
    localStorage.removeItem(this.storageKey);
    this.tableauSubject.next(this.tableauDevis);
  }

  private saveToLocalStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tableauDevis));
  }

  // Générer un fichier Excel côté client et lancer le téléchargement
  genererExcel(filename: string = 'DEVIS.xlsx'): void {
    if (!this.tableauDevis || this.tableauDevis.length === 0) {
      alert('Le tableau est vide, impossible de générer un fichier Excel.');
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.tableauDevis);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Devis');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  }

  // --- NOUVEAU : méthode pour télécharger le modèle Excel depuis le serveur ---
  telechargerTemplateExcel(): Observable<Blob> {
    // URL à adapter selon ton API backend
    const url = 'http://localhost:3000/api/get-devis-template-excel';
    return this.http.get(url, { responseType: 'blob' });
  }
}
