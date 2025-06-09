import { Component, OnInit } from '@angular/core'; 
import { ExcelDataService } from '../../service/excel-data.service';

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
      error: (err) => {
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
    // TODO : logique pour générer et télécharger un fichier Excel ou PDF
  }
}
