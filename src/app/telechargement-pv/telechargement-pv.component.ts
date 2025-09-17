// src/app/telechargement-pv/telechargement-pv.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DocumentToSignService } from '../services/document-to-sign.service';
import { Subscription } from 'rxjs'; // Ajout de l'importation de Subscription pour la gestion des abonnements

@Component({
  selector: 'app-telechargement-pv',
  templateUrl: './telechargement-pv.component.html', 
  styleUrls: ['./telechargement-pv.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class TelechargementPvComponent implements OnInit {
  // Déclaration des propriétés de la classe
  pvInfo: any = null;
  error: any = null; 
  loading = false;
  pvDocuments: any[] = [];
  previewUrl: SafeUrl = '';
  documentToSign: any = null; // Ajout d'une propriété pour le document à signer

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private documentToSignService: DocumentToSignService
  ) {}

  ngOnInit(): void {
    // Charge tous les documents au chargement de la page.
    this.loadAllPvDocuments();
  }

  /**
   * Prépare un document pour la signature électronique et navigue vers la page de signature.
   * Cette fonction remplace la logique asynchrone pour la simplifier.
   * Elle doit être la seule et unique fonction 'signDocument' dans le composant.
   * @param doc Le document à signer.
   */
  signDocument(doc: any): void {
    // 1. Utilisez le service pour stocker le document.
    this.documentToSignService.setDocumentToSign(doc);
    
    // 2. Naviguez vers la page de signature électronique.
    this.router.navigate(['/signature-electronique']);
  }
  
  /**
   * Charge tous les documents de la base de données et filtre les PVs.
   * Affiche le premier PV de la liste s'il en existe.
   */
  async loadAllPvDocuments(): Promise<void> {
    this.loading = true;
    try {
      const { data, error } = await this.supabaseService.getAllDocuments();
      if (error) {
        throw error;
      }
      
      this.pvDocuments = (data || []).filter((doc: any) => doc.category.toLowerCase() === 'pv');

      if (this.pvDocuments.length > 0) {
        // Affiche le premier document par défaut
        await this.viewDocumentAndDetails(this.pvDocuments[0]);
      } else {
        this.pvInfo = null;
        this.previewUrl = '';
      }
    } catch (error: any) {
      this.error = error.message;
      console.error('Erreur lors du chargement de tous les PVs :', error);
    } finally {
      this.loading = false;
    }
  }
    
  /**
   * Récupère les détails d'un PV à partir de son ID.
   * @param doc Le document à traiter.
   */
  async displayDocumentDetails(doc: any): Promise<void> {
    this.loading = true;
    try {
      if (doc.pv_title || doc.pv_content) {
        this.pvInfo = doc;
        return;
      }
      
      if (doc.id) {
        const { data: pvDetails, error } = await this.supabaseService.getPvDetails(doc.id);
        
        if (error) {
          console.error('Erreur lors de la récupération des détails du PV:', error);
          this.pvInfo = doc;
        } else {
          this.pvInfo = { ...doc, ...pvDetails };
        }
      } else {
        this.pvInfo = doc;
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      this.pvInfo = doc;
    } finally {
      this.loading = false;
    }
  }
    
  /**
   * Gère la prévisualisation et l'affichage des détails d'un document.
   * @param doc Le document à afficher.
   */
  async viewDocumentAndDetails(doc: any): Promise<void> {
    await this.displayDocumentDetails(doc);
    if (doc && doc.file_url) {
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc.file_url);
    } else {
      this.previewUrl = '';
    }
  }

  /**
   * Définit le document à signer et l'affiche dans la zone de prévisualisation.
   * Le bouton de signature dans le HTML utilisera cet événement.
   * @param doc Le document à signer.
   */
  prepareDocumentForSigning(doc: any): void {
    // Affiche le document dans le canvas de prévisualisation
    this.viewDocumentAndDetails(doc); 
    // Définit le document à signer pour un traitement ultérieur si nécessaire
    this.documentToSign = doc;
    // On pourrait ajouter ici une logique pour afficher les outils de signature.
  }

  /**
   * Télécharge un document.
   * @param doc Le document à télécharger.
   */
  telechargerDocument(doc: any): void {
    if (doc && doc.file_url) {
      this.http.get(doc.file_url, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.file_name || 'document';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: () => {
          this.error = `Impossible de télécharger "${doc.file_name}".`;
        }
      });
    } else {
      this.error = `Aucun fichier n'a été uploadé pour "${doc.file_name}".`;
    }
  }

  /**
   * Ouvre le document dans un nouvel onglet pour la prévisualisation.
   * @param doc Le document à prévisualiser.
   */
  previewDocument(doc: any): void {
    if (doc && doc.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      this.error = 'Aucun fichier n\'est disponible pour la prévisualisation.';
    }
  }
}
