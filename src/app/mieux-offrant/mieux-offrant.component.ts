import { Component } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mieux-offrant',
  templateUrl: './mieux-offrant.component.html',
  styleUrls: ['./mieux-offrant.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class MieuxOffrantComponent {
  /* 1. Identité AO */
  ao = {
    objet: '',
    reference: 'AO-24-037',
    datePublication: new Date('2025-03-18'),
    dateOuverture: new Date('2025-04-21')
  };

  /* 2. Liste des offres */
  offres = [
    {
      fournisseur: {
        nom: '',
        logoUrl: 'assets/logos/buildcorp.png'
      },
      montantTotal: 4520000,
      devise: 'MAD',
      delai: {
        dateDebut: new Date('2025-06-01'),
        dateFin: new Date('2025-10-30'),
        etapes: [
          { nom: 'Début VRD', date: new Date('2025-06-15') },
          { nom: 'Réseaux secs', date: new Date('2025-08-01') },
          { nom: 'Signalisation', date: new Date('2025-10-10') }
        ]
      },
      conformiteTechnique: { score: 92 },
      conformiteAdministrative: { statut: 'Conforme', manquements: [] },
      noteGlobale: 90.25
    },
    {
      fournisseur: {
        nom: '',
        logoUrl: 'assets/logos/constructplus.png'
      },
      montantTotal: 4875000,
      devise: 'MAD',
      delai: {
        dateDebut: new Date('2025-06-10'),
        dateFin: new Date('2025-11-15'),
        etapes: []
      },
      conformiteTechnique: { score: 88 },
      conformiteAdministrative: { statut: 'Conforme', manquements: ['Attestation fiscale manquante'] },
      noteGlobale: 85.75
    }
  ];

  /* 3. Info fournisseur */
  fournisseur = {
    raisonSociale: '',
    rc: 'RC',
    adresse: '',
    contact: '',
    tel: ''
  };

  /* 4. Commission d'évaluation */
  commissionMembers = [
    { name: '', initials: '' },
    { name: '', initials: '' },
    { name: '', initials: '' }
  ];

  /* 5. Critères techniques */
  technicalCriteria = [
    { nom: '', ponderation: 20, note: 8 },
    { nom: '', ponderation: 30, note: 7 },
    { nom: '', ponderation: 20, note: 9 },
    { nom: '', ponderation: 30, note: 9 }
  ];

  /* 6. Recommandation */
  recommandation = { texte: 'Retenir     comme mieux-disant technique et financier.' };
  commentairesChefProjet = '';

  /* Méthodes utilitaires */
  calculateAverage(criteres: any[]): number {
    const sum = criteres.reduce((acc, curr) => acc + curr.note, 0);
    return sum / criteres.length;
  }

  calculateWeightedAverage(criteres: any[]): number {
    return criteres.reduce((acc, curr) => acc + (curr.note * curr.ponderation / 10), 0);
  }

  openDocument(type: string) {
    console.log(`Ouverture du document ${type}`);
    // Implémentation réelle à ajouter
  }

  validateDecision() {
    // Implémentation à compléter
    alert('Décision validée avec succès');
  }

  requestModification() {
    // Implémentation à compléter
    alert('Modification demandée');
  }

  rejectDecision() {
    // Implémentation à compléter
    alert('Décision rejetée');
  }
}

