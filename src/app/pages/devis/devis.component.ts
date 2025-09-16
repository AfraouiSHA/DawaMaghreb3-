import { Component, OnInit } from '@angular/core';  
import { ExcelDataService } from '../../service/excel-data.service';
import { saveAs } from 'file-saver';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.css']
})
export class DevisComponent implements OnInit {
  donneesExcel: any[] = [];
  colonnes: string[] = [];

  constructor(private excelService: ExcelDataService) {}

  ngOnInit(): void {
    this.excelService.getTableauDevis().subscribe({
      next: (data: any[]) => {
        console.log("✅ Données Excel récupérées :", data);
        this.donneesExcel = data || [];

        if (this.donneesExcel.length > 0) {
          this.colonnes = Object.keys(this.donneesExcel[0]);
        } else {
          console.warn("⚠️ Le tableau Excel est vide.");
          this.colonnes = [];
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('❌ Erreur lors de la récupération des données Excel :', err);
        this.donneesExcel = [];
        this.colonnes = [];
      }
    });
  }

  sauvegarder(): void {
    try {
      console.log("📝 Données à sauvegarder :", this.donneesExcel);

      if (!this.donneesExcel || !Array.isArray(this.donneesExcel)) {
        throw new Error("❌ donneesExcel est vide ou invalide.");
      }

      this.excelService.setTableauDevis(this.donneesExcel);
      alert('✅ Modifications sauvegardées avec succès !');
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde :", error);
      alert('Erreur lors de la sauvegarde. Vérifiez la console pour plus de détails.');
    }
  }

  telecharger(): void {
    console.log('Méthode telecharger() appelée');
    this.excelService.telechargerTemplateExcel().subscribe({
      next: (blob: Blob) => {
        saveAs(blob, 'DEVIS_TEMPLATE.xlsx');
        console.log('✅ Téléchargement du fichier Excel déclenché.');
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Erreur lors du téléchargement du modèle Excel :', error);
        alert('Erreur lors du téléchargement du modèle Excel depuis le serveur.');
      }
    });
  }
}
