import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Renommage de l'interface pour éviter les conflits avec le type global "Document"
export interface UploadedDocument {
  _id: string;
  originalName: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = 'http://localhost:3000/documents';

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste des documents pour un rôle donné (fournisseur, MO, etc.)
   */
  getDocuments(role: string = 'fournisseur'): Observable<UploadedDocument[]> {
    return this.http.get<UploadedDocument[]>(`${this.apiUrl}?role=${role}`);
  }

  /**
   * Télécharge un document via son identifiant (nom de fichier dans ce cas)
   */
  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob',
    });
  }

  /**
   * Supprime un document via son identifiant
   */
  deleteDocument(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Envoie un fichier au serveur, en associant un rôle
   */
  uploadDocument(file: File, role: string): Observable<UploadedDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);

    return this.http.post<UploadedDocument>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Récupère les données d’un fichier Excel sous forme de tableau JSON
   */
  getExcelData(filename: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${filename}/data`);
  }
}


