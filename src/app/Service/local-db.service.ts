// src/app/service/local-db.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Rend ce service disponible globalement dans l'application
})
export class LocalDbService {
  private db: IDBDatabase | null = null; // Instance de la base de données IndexedDB
  private readonly dbName = 'MyAppDb'; // Nom de la base de données
  private readonly storeName = 'excelDataStore'; // Nom de l'Object Store

  constructor() {
    this.openDb().catch(error => {
      console.error('Erreur lors de l\'initialisation IndexedDB :', error);
    });
  }

  /**
   * Ouvre ou crée la base de données IndexedDB.
   * @returns Une promesse résolue à l'ouverture ou rejetée en cas d'erreur.
   */
  private openDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('Erreur IndexedDB à l\'ouverture :', request.error);
        reject('Échec de l\'ouverture d\'IndexedDB.');
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB ouvert avec succès');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
          console.log('Object Store créé :', this.storeName);
        }
      };
    });
  }

  /**
   * Sauvegarde des données dans IndexedDB.
   * @param key Clé sous laquelle les données seront stockées.
   * @param data Données à enregistrer.
   */
  async saveExcelData(key: string, data: any): Promise<void> {
    if (!this.db) await this.openDb(); // Assurez-vous que la DB est ouverte

    return new Promise((resolve, reject) => {
      if (!this.db) return reject('IndexedDB non disponible.');

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data, key); // 'put' insère ou met à jour

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Erreur lors de la sauvegarde :', request.error);
        reject('Échec de la sauvegarde des données.');
      };
    });
  }

  /**
   * Récupère des données depuis IndexedDB.
   * @param key Clé des données à récupérer.
   * @returns Les données ou null si non trouvées.
   */
  async getExcelData(key: string): Promise<any | null> {
    if (!this.db) await this.openDb(); // Assurez-vous que la DB est ouverte

    return new Promise((resolve, reject) => {
      if (!this.db) return reject('IndexedDB non disponible.');

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Erreur lors de la récupération :', request.error);
        reject('Échec de la récupération des données.');
      };
    });
  }

  /**
   * Supprime des données de IndexedDB.
   * @param key Clé des données à supprimer.
   */
  async deleteExcelData(key: string): Promise<void> {
    if (!this.db) await this.openDb(); // Assurez-vous que la DB est ouverte

    return new Promise((resolve, reject) => {
      if (!this.db) return reject('IndexedDB non disponible.');

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Erreur lors de la suppression :', request.error);
        reject('Échec de la suppression des données.');
      };
    });
  }

  /**
   * Génère et sauvegarde un jeu de données Excel fictives qui simule la structure attendue.
   * Cela inclut les lignes d'en-tête, les données, et les lignes de totaux.
   * @param key Clé sous laquelle enregistrer les données.
   */
  async saveExampleExcelData(key: string): Promise<void> {
    const exampleData: any[][] = [];

    // Ajoute 4 lignes vides initiales (pour correspondre aux premières lignes de l'Excel)
    for (let i = 0; i < 4; i++) {
      exampleData.push([]);
    }

    // Ligne des en-têtes (qui sera à l'index 4, donc la 5ème ligne de l'Excel)
    exampleData.push(["DESIGNATION", "REFERENCE", "QUANTITE", "PRIX UNITAIRE EN HT", "PRIX TOTAL EN HT"]);

    // Lignes de données simulées (de l'index 5 à 18, soit 14 lignes de données)
    for (let i = 0; i < 14; i++) {
      const quantity = Math.floor(Math.random() * 10) + 1;
      const unitPrice = parseFloat((Math.random() * 100 + 10).toFixed(2));
      exampleData.push([
        `Article Test ${i + 1}`,
        `REF-EX${100 + i}`,
        quantity,
        unitPrice,
        parseFloat((quantity * unitPrice).toFixed(2)) // Prix total calculé
      ]);
    }

    // Complète avec des lignes vides jusqu'à la 19ème ligne (index 18), si moins de 14 articles
    while (exampleData.length <= 18) {
      exampleData.push([]);
    }

    // Ajoute les lignes de résumé (TOTAL, TVA, TTC) après les lignes de données
    const totalHTCalc = exampleData.slice(5, 19).reduce((sum, row) => {
        const qty = Number(row[2]) || 0; // Quantité (index 2)
        const price = Number(row[3]) || 0; // Prix Unitaire (index 3)
        return sum + (qty * price);
    }, 0);
    const tvaCalc = totalHTCalc * 0.20; // Exemple 20% TVA
    const totalTtcCalc = totalHTCalc + tvaCalc;


    exampleData.push(["", "", "", "TOTAL HT", totalHTCalc.toFixed(2)]);
    exampleData.push(["", "", "", "TVA (20%)", tvaCalc.toFixed(2)]);
    exampleData.push(["", "", "", "TOTAL TTC", totalTtcCalc.toFixed(2)]);


    return this.saveExcelData(key, exampleData);
  }
}
