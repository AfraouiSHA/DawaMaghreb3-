import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  selectedFile: File | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.clearMessages();
    } else {
      this.selectedFile = null;
      this.errorMessage = '❌ Aucune sélection de fichier détectée.';
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.errorMessage = '⚠️ Aucun fichier sélectionné.';
      this.successMessage = '';
      return;
    }

    const allowedExtensions = ['xlsx', 'xls', 'csv'];
    const fileExtension = this.selectedFile.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      this.errorMessage = '❌ Veuillez sélectionner un fichier Excel valide (.xlsx, .xls, .csv)';
      this.successMessage = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('role', 'maitre_ouvrage');

    this.http.post<{
      message: string;
      filename: string;
      originalname: string;
      path: string;
    }>('http://localhost:3000/documents/upload', formData).subscribe({
      next: (res) => {
        console.log('Réponse backend:', res);
        this.successMessage = `✅ ${res.message}`;
        this.errorMessage = '';
        this.selectedFile = null;
      },
      error: (err) => {
        console.error('Erreur HTTP:', err);
        this.errorMessage = `❌ Erreur : ${err.error?.message || err.message || 'Serveur injoignable'}`;
        this.successMessage = '';
      }
    });
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}

