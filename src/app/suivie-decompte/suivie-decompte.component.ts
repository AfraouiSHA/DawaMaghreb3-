import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-suivie-decompte',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suivie-decompte.component.html',
  styleUrls: ['./suivie-decompte.component.css']
})
export class SuivieDecompteComponent {
  projet = {
    nom: 'Installation Ligne Stérile',
    reference: 'AO-2025-034',
    client: '',
    dateDebut: '',
    echeance: '',
    statut: 'En cours'
  };

  decomptes = [
    {
      id: 1,
      periode: 'Janv 2025',
      montantHT: '100 000 MAD',
      montantTTC: '120 000 MAD',
      etat: 'Validé',
      dateValidation: '05/02/2025',
      dateSoumission: '28/01/2025',
      datePaiement: '10/02/2025',
      montantPaye: '120 000 MAD',
      justificatif: '/assets/documents/decompte1.pdf'
    },
    {
      id: 2,
      periode: 'Fév 2025',
      montantHT: '85 000 MAD',
      montantTTC: '102 000 MAD',
      etat: 'En attente',
      dateValidation: null,
      dateSoumission: '01/03/2025',
      datePaiement: null,
      montantPaye: null,
      justificatif: null
    }
  ];
}
