import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExcelDataService {
  private readonly storageKey = 'tableauDevis';
  private tableauDevis: any[][] = [];
  private tableauSubject = new BehaviorSubject<any[][]>([]);

  constructor() {
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
}
