import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PdfViewerModule, PDFDocumentProxy } from 'ng2-pdf-viewer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-electronique',
  templateUrl: './signature-electronique.component.html',
  styleUrls: ['./signature-electronique.component.css'],
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
})
export class SignatureElectroniqueComponent implements OnInit {
  @ViewChild('pdfContainer', { static: false }) pdfContainer!: ElementRef;

  fileName: string = "Aucun fichier n’a été sélectionné";
  today: Date = new Date();
  pdfSrc: string | undefined = undefined;
  signaturePosition: { x: number, y: number } | null = null;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;

  // Informations utilisateur
  utilisateur = {
    nom: '',
    fonction: 'Chef de projet',
    email: '@dawa.com'
  };

  // Informations sur le document
  document = {
    titre: 'PV de Commission',
    dateCreation: new Date(),
    referenceInterne: 'REF-12345',
    nombreSignataires: 3
  };

  // Liste des signataires
  signataires = [
    { nom: '', fonction: 'Chef de projet', email: '@dawa.com', signe: true, dateSignature: '2025-05-05 13:42' },
    { nom: '', fonction: 'Maître d’ouvrage', email: '@dawa.com', signe: false, dateSignature: '' },
    
  ];

  ngOnInit() {
    const signatureCanvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (signatureCanvas) {
      this.ctx = signatureCanvas.getContext('2d')!;
      signatureCanvas.addEventListener('mousedown', () => this.drawing = true);
      signatureCanvas.addEventListener('mouseup', () => {
        this.drawing = false;
        this.ctx.beginPath();
      });
      signatureCanvas.addEventListener('mousemove', (e) => this.draw(e));
    }
  }

  chargerPDF(pdf: PDFDocumentProxy): void {
    setTimeout(() => {
      const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
      const viewer = this.pdfContainer.nativeElement;

      if (canvas && viewer) {
        canvas.width = viewer.clientWidth;
        canvas.height = viewer.clientHeight;
      }
    }, 200); 
  }

  placerSignature(event: MouseEvent): void {
    const pdfCanvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
    const context = pdfCanvas.getContext('2d');
    if (!context) return;

    const rect = pdfCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const signatureCanvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!signatureCanvas) return;

    const signatureDataUrl = signatureCanvas.toDataURL();
    const signatureImage = new Image();
    signatureImage.onload = () => {
      const scale = 0.5;
      const width = signatureImage.width * scale;
      const height = signatureImage.height * scale;
      context.drawImage(signatureImage, x, y, width, height);
    };
    signatureImage.src = signatureDataUrl;
  }

  draw(e: MouseEvent): void {
    if (!this.drawing) return;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000';
    this.ctx.lineTo(e.offsetX, e.offsetY);
    this.ctx.stroke();
  }

  effacerSignature(): void {
    const signatureCanvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (signatureCanvas) {
      const ctx = signatureCanvas.getContext('2d')!;
      ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    }
  }

  ajouterFichier(): void {
    // Logique pour ajouter un fichier si nécessaire
  }

  telechargerDocument(): void {
    // Logique pour télécharger le document signé
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.pdfSrc = reader.result as string;
      };
    }
  }
}










