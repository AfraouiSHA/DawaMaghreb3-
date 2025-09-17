// src/app/shared/models/Document.model.ts

export interface DocumentModel {
  id?: string;
  nomDocuments: string;
  date: Date;
  auteur: string;
  description: string;
  typeDocument: string;
  url: string;
  // Ajoutez d'autres propriétés si nécessaire pour correspondre à votre table Supabase
}