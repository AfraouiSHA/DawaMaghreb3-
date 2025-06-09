// src/app/services/local-db.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Indique que ce service est disponible globalement dans l'application
})
export class LocalDbService {
  private db: IDBDatabase | null = null; // Variable pour stocker l'instance de la base de données IndexedDB
  private dbName: string = 'MyAppDb'; // Nom de votre base de données IndexedDB
  private storeName: string = 'excelDataStore'; // Nom de l'Object Store où les données Excel seront stockées

  constructor() {
    this.openDb(); // Ouvre la base de données IndexedDB dès que le service est instancié
  }

  /**
   * Ouvre (ou crée si elle n'existe pas) la base de données IndexedDB.
   * Cette méthode est appelée au démarrage du service.
   * @returns Une promesse qui résout lorsque la base de données est ouverte, ou rejette en cas d'erreur.
   */
  private openDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Tente d'ouvrir la base de données avec le nom et la version spécifiés
      // La version (ici 1) est importante pour les mises à niveau de schéma
      const request = indexedDB.open(this.dbName, 1);

      // Gère les erreurs qui peuvent survenir lors de l'ouverture de la base de données
      request.onerror = (event: Event) => {
        console.error('Erreur IndexedDB lors de l\'ouverture :', (event.target as IDBRequest).error);
        reject('Erreur lors de l\'ouverture d\'IndexedDB.');
      };

      // Gère le succès de l'ouverture de la base de données
      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBRequest).result; // Stocke l'instance de la DB
        console.log('IndexedDB ouvert avec succès');
        resolve(); // Résout la promesse
      };

      // Se déclenche uniquement si la version de la base de données spécifiée est plus récente
      // que la version actuellement installée par le navigateur de l'utilisateur.
      // C'est ici que l'on crée ou met à jour les "object stores" (tables)
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBRequest).result;
        // Vérifie si l'object store (comme une table) existe déjà. S'il n'existe pas, le crée.
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName); // Crée l'object store
          console.log('Object Store créé :', this.storeName);
        }
      };
    });
  }

  /**
   * Sauvegarde des données dans l'Object Store d'IndexedDB.
   * Utilise 'put' pour ajouter ou mettre à jour des données.
   * @param key La clé unique sous laquelle les données seront stockées (ex: 'devisData').
   * @param data Les données à sauvegarder (un tableau JSON parsé de l'Excel, par exemple).
   * @returns Une promesse qui résout en cas de succès ou rejette en cas d'erreur.
   */
  async saveExcelData(key: string, data: any): Promise<void> {
    if (!this.db) {
      await this.openDb(); // S'assure que la base de données est ouverte avant toute opération
    }
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject('IndexedDB non disponible. Erreur d\'ouverture.');
      }
      // Commence une transaction en mode 'readwrite' pour écrire des données
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      // 'put' ajoute ou met à jour l'entrée avec la clé donnée
      const request = store.put(data, key);

      // Gère le succès de la requête de sauvegarde
      request.onsuccess = () => {
        resolve();
      };

      // Gère les erreurs lors de la requête de sauvegarde
      request.onerror = (event: Event) => {
        console.error('Erreur IndexedDB lors de la sauvegarde :', (event.target as IDBRequest).error);
        reject('Erreur lors de la sauvegarde des données.');
      };
    });
  }

  /**
   * Récupère des données depuis l'Object Store d'IndexedDB.
   * @param key La clé des données à récupérer.
   * @returns Une promesse qui résout avec les données récupérées ou null si non trouvées,
   * ou rejette en cas d'erreur.
   */
  async getExcelData(key: string): Promise<any | null> {
    if (!this.db) {
      await this.openDb(); // S'assure que la base de données est ouverte
    }
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject('IndexedDB non disponible. Erreur d\'ouverture.');
      }
      // Commence une transaction en mode 'readonly' pour lire des données
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key); // Récupère les données par leur clé

      // Gère le succès de la requête de récupération
      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBRequest).result || null); // Résout avec le résultat ou null
      };

      // Gère les erreurs lors de la requête de récupération
      request.onerror = (event: Event) => {
        console.error('Erreur IndexedDB lors de la récupération :', (event.target as IDBRequest).error);
        reject('Erreur lors de la récupération des données.');
      };
    });
  }

  /**
   * Supprime des données de l'Object Store d'IndexedDB.
   * @param key La clé des données à supprimer.
   * @returns Une promesse qui résout en cas de succès ou rejette en cas d'erreur.
   */
  async deleteExcelData(key: string): Promise<void> {
    if (!this.db) {
      await this.openDb(); // S'assure que la base de données est ouverte
    }
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject('IndexedDB non disponible. Erreur d\'ouverture.');
      }
      // Commence une transaction en mode 'readwrite' pour supprimer des données
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key); // Supprime l'entrée par sa clé

      // Gère le succès de la requête de suppression
      request.onsuccess = () => {
        resolve();
      };

      // Gère les erreurs lors de la requête de suppression
      request.onerror = (event: Event) => {
        console.error('Erreur IndexedDB lors de la suppression :', (event.target as IDBRequest).error);
        reject('Erreur lors de la suppression des données.');
      };
    });
  }
}