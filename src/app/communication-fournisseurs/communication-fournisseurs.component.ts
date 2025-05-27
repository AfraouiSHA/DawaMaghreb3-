import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // NgIf, NgFor, pipes comme date
import { FormsModule } from '@angular/forms';    // ngModel

@Component({
  selector: 'app-communication-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './communication-fournisseurs.component.html',
  styleUrls: ['./communication-fournisseurs.component.css']
})
export class CommunicationFournisseursComponent {
  fournisseurs = [
    {
      id: 1,
      nom: 'NetCom SARL',
      iceEntreprise: '00123456700013',
      email: 'contact@netcom.ma',
      telephone: '+212 6 12 34 56 78',
      adresse: '45 Rue des technologies, Rabat',
      dateNotification: new Date('2025-05-20'),
      marche: {
        reference: 'AO-2025-009',
      
        dateAttribution: new Date('2025-05-20'),
        montant: 150000,
        duree: '12 mois',
        modePassation: 'Appel d\'offres',
        objet: ''
      }
    }
  ];

  fournisseurSelectionne: any = null;

  messages: { contenu: string; envoyePar: string; date: Date }[] = [];

  nouveauMessage: string = '';

  nouveauFournisseur = {
    nom: '',
    iceEntreprise: '',
    email: '',
    telephone: '',
    adresse: ''
  };

  selectionnerFournisseur(fournisseur: any) {
    this.fournisseurSelectionne = fournisseur;

    // Exemple de messages initialisés ou récupérer depuis un service
    this.messages = [
      { contenu: ' ', envoyePar: 'fournisseur', date: new Date() },
      { contenu: '', envoyePar: 'moi', date: new Date() }
    ];
  }

  envoyerMessage() {
    if (this.nouveauMessage.trim() === '') return;
    this.messages.push({
      contenu: this.nouveauMessage,
      envoyePar: 'moi',
      date: new Date()
    });
    this.nouveauMessage = '';
  }

  ajouterFournisseur() {
    if (
      !this.nouveauFournisseur.nom ||
      !this.nouveauFournisseur.iceEntreprise ||
      !this.nouveauFournisseur.email
    ) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const nouvelId = this.fournisseurs.length
      ? Math.max(...this.fournisseurs.map(f => f.id)) + 1
      : 1;

    this.fournisseurs.push({
      id: nouvelId,
      nom: this.nouveauFournisseur.nom,
      iceEntreprise: this.nouveauFournisseur.iceEntreprise,
      email: this.nouveauFournisseur.email,
      telephone: this.nouveauFournisseur.telephone,
      adresse: this.nouveauFournisseur.adresse,
      dateNotification: new Date(),
      marche: {
        reference: 'MCH-001',
        dateAttribution: new Date('2024-06-01'),
        montant: 50000,
        duree: '6 mois',
        modePassation: 'Appel d\'offres',
        objet: 'Fourniture de matériel informatique'
      }
    });

    // Reset form 
    this.nouveauFournisseur = {
      nom: '',
      iceEntreprise: '',
      email: '',
      telephone: '',
      adresse: ''
    };
  }

  envoyermessage() {
    if (!this.fournisseurSelectionne) return;

    console.log(
      `Message d'attribution envoyé au Fournisseur ${this.fournisseurSelectionne.nom}`
    );

    alert(`Demande le messgae d'attribution au fournisseur pour ${this.fournisseurSelectionne.nom}`);
  }

  modifierMessage() {
    alert('Fonction "Modifier le message" à implémenter');
  }

  joindreDocuments() {
    alert('Fonction "Joindre des documents" à implémenter');
  }

  relancerFournisseur() {
    alert('Fonction "Relancer le fournisseur" à implémenter');
  }

  telechargerElements() {
    alert('Fonction "Télécharger tous les éléments" à implémenter');
  }
}
