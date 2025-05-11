import { Component } from '@angular/core';


@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',  
  styleUrls: ['./pdf-viewer.component.css']  
})
export class PdfViewerComponent {
  public pdfSrc: string = '';  // Par défaut, vide

  // Méthode pour gérer la sélection du fichier PDF
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.pdfSrc = URL.createObjectURL(file);
    }
  }
}
