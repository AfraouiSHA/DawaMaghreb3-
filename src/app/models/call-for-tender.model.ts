// src/app/models/call-for-tender.model.ts

/**
 * Interface représentant un Appel d'Offres (Call For Tender).
 * Cette interface définit la structure des données d'un appel d'offres
 * telles qu'elles sont reçues du backend.
 */
export interface CallForTender {
  _id: string; // ID unique de l'appel d'offres, généré par la base de données
  refAO: string; // Référence de l'appel d'offres
  objetAO: string; // Objet de l'appel d'offres
  dateLimite: string; // Date limite de soumission de l'appel d'offres (format string, ex: YYYY-MM-DD)
  dateOuverture: string; // Date d'ouverture des plis
  lieuOuverture: string; // Lieu d'ouverture des plis
  cautionProvisoire: number; // Montant de la caution provisoire
  prixAcquisition: number; // Prix d'acquisition du dossier d'appel d'offres
  status: 'Ouvert' | 'Fermé' | 'Annulé'; // Statut de l'appel d'offres
  documents: { // Objets de documents avec leurs chemins ou informations
    cahierDesCharges: string;
    reglementConsultation: string;
    autreDocument?: string; // Optionnel
  };
  detailsAdditionnels?: string; // Détails supplémentaires optionnels
  createdAt: string; // Date de création de l'enregistrement
  updatedAt: string; // Date de la dernière mise à jour
}
