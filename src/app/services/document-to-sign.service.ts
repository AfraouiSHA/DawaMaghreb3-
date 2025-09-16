// src/app/services/document-to-sign.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentToSignService {
  // Crée un BehaviorSubject qui peut contenir n'importe quel type de document (any)
  // Il est initialisé avec `null`
  private documentToSignSource = new BehaviorSubject<any>(null);

  // Expose le document sous forme d'Observable pour que les composants puissent s'y abonner
  currentDocument = this.documentToSignSource.asObservable();

  constructor() { }

  // Méthode pour définir le document. Les "abonnés" seront notifiés.
  setDocumentToSign(doc: any): void {
    this.documentToSignSource.next(doc);
  }
}