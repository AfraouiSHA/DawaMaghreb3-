// src/app/pages/communication-fournisseurs/communication-fournisseurs.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf, NgFor, CurrencyPipe, PercentPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from 'src/app/services/supabase.service';

// Interface for a supplier (corresponding to the 'fournisseurs' table columns)
interface FournisseurSupabase {
  id_fournisseur: string;
  nom_entreprise: string;
  ice: string;
  email_entreprise: string;
  telephone_entreprise?: string;
  adresse_entreprise?: string;
  created_at?: string;
  ref_ao?: string;
  objet_ao?: string;
  total_ttc?: number;
  delai_execution?: number;
  numeroAO: string;
  statut?: string;
  taxe_pro: string;
  cnss: string;
  compte_bancaire?: string;
  // Correction : Ajouter la propriété 'decision' ici
  decision?: {
    fournisseur_retenu: string | null;
    fournisseur_non_retenu: string | null;
  } | null;
}


// Interface for the awarded "marche" information (used in HTML)
interface MarcheAttribution {
  reference: string;
  dateAttribution: Date;
  montant: number;
  duree: string;
  modePassation: string;
  objet: string;
}

// Interface for a message (for history)
interface Message {
  id?: string;
  fournisseur_id: string;
  content: string;
  created_at: string;
  is_sent_by_admin: boolean;
}

@Component({
  selector: 'app-communication-fournisseurs',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, NgIf, NgFor],
  templateUrl: './communication-fournisseurs.component.html',
  styleUrls: ['./communication-fournisseurs.component.css']
})
export class CommunicationFournisseursComponent implements OnInit {

  fournisseurs: FournisseurSupabase[] = [];
  fournisseurSelectionne: FournisseurSupabase | null = null;
  marcheAttribution: MarcheAttribution | null = null;
  messageAttributionContent: string = '';
  newMessageContent: string = '';
  messagesHistory: Message[] = [];
  feedbackMessage: string = '';
  isError: boolean = false;
  loading: boolean = false;
  headerMessage: string = '';

  nouveauFournisseur = {
    nom_entreprise: '',
    ice: '',
    email_entreprise: '',
    telephone_entreprise: '',
    adresse_entreprise: '',
    compte_bancaire: '',
    taxe_pro: '',
    cnss: ''
  };

  constructor(private http: HttpClient, private supabaseService: SupabaseService, private cdr: ChangeDetectorRef) { }

  async ngOnInit(): Promise<void> {
    console.log('[DEBUG] CommunicationFournisseursComponent: ngOnInit called.');
    await this.fetchFournisseursFromSupabase();
    console.log('Fournisseurs après fusion :', this.fournisseurs);
  }

  /**
   * Loads supplier information from Supabase's 'fournisseurs' table.
   */
  async fetchFournisseursFromSupabase(): Promise<void> {
  this.loading = true;
  this.feedbackMessage = 'Chargement des fournisseurs...';
  this.isError = false;

  try {
    // 1️⃣ Récupérer les fournisseurs
    const { data: fournisseursData, error: fError } = await this.supabaseService
      .getClient()
      .from('fournisseurs')
      .select('*');

    if (fError) throw fError;
    // Ajout d'un log pour vérifier les données brutes
    console.log('[DEBUG] Données fournisseurs brutes:', fournisseursData);

    // 2️⃣ Récupérer les décisions
    const { data: decisionsData, error: dError } = await this.supabaseService
      .getClient()
      .from('decision')
      .select('id_fournisseur, fournisseur_retenu, fournisseur_non_retenu');

    if (dError) throw dError;
    // Ajout d'un log pour vérifier les décisions
       console.log('[DEBUG] Données de décision brutes récupérées :', decisionsData);


    // 3️⃣ Fusionner les données
    this.fournisseurs = fournisseursData.map((f: any) => {
      const d = decisionsData.find((d: any) => d.id_fournisseur === f.id_fournisseur);
      return {
        ...f,
        decision: d || null
      };
    });
    console.log('[DEBUG] Fournisseurs après fusion :', this.fournisseurs);

    this.feedbackMessage = `${this.fournisseurs.length} fournisseur(s) chargé(s).`;
    this.isError = false;
  } catch (err: any) {
    this.feedbackMessage = `Erreur : ${err.message}`;
    this.isError = true;
  } finally {
    this.loading = false;
  }
}

  /**
   * Selects a supplier from the list to display their details and load message history.
   * @param fournisseur The selected supplier.
   */
 selectionnerFournisseur(fournisseur: FournisseurSupabase): void {
  this.fournisseurSelectionne = fournisseur;
  
  // Logique pour définir le message d'en-tête
  if (fournisseur.decision?.fournisseur_retenu === fournisseur.nom_entreprise) {
    this.headerMessage = `Message d'attribution au Fournisseur Retenu : ${fournisseur.nom_entreprise}`;
  } else if (fournisseur.decision?.fournisseur_non_retenu === fournisseur.nom_entreprise) {
    this.headerMessage = `Message d'attribution au Fournisseur Non Retenu : ${fournisseur.nom_entreprise}`;
  } else {
    this.headerMessage = 'Communication avec le fournisseur';
  }

  // --- NOUVEAU: Génération automatique du message en fonction des données ---
  if (fournisseur.decision?.fournisseur_retenu === fournisseur.nom_entreprise) {
    // Message pour le fournisseur RETENU
    this.messageAttributionContent = `Objet: Notification d'attribution du marché n°${fournisseur.numeroAO || 'N/A'}

Cher Monsieur/Madame ${fournisseur.nom_entreprise},

Nous avons le plaisir de vous informer que votre entreprise a été sélectionnée pour l'attribution du marché concernant l'objet suivant : ${fournisseur.objet_ao || 'N/A'}.

Nous vous invitons à consulter les documents d'attribution et à prendre contact avec nos services pour la signature du contrat.
`;
  } else if (fournisseur.decision?.fournisseur_non_retenu === fournisseur.nom_entreprise) {
    // Message pour le fournisseur NON RETENU
    this.messageAttributionContent = `Objet: Notification des résultats de l'appel d'offres n°${fournisseur.numeroAO || 'N/A'}

Cher Monsieur/Madame ${fournisseur.nom_entreprise},

Nous tenons à vous remercier pour votre participation à l'appel d'offres relatif à l'objet suivant : ${fournisseur.objet_ao || 'N/A'}.

Nous vous informons par la présente que, après évaluation, votre offre n'a malheureusement pas été retenue pour ce marché.
`;
  } else {
    // Si la décision n'est pas claire, le message est vide
    this.messageAttributionContent = '';
  }

  // Mise à jour des détails du marché
  this.marcheAttribution = {
    reference: fournisseur.numeroAO || 'N/A',
    dateAttribution: fournisseur.created_at ? new Date(fournisseur.created_at) : new Date(),
    montant: fournisseur.total_ttc || 0,
    duree: fournisseur.delai_execution ? `${fournisseur.delai_execution} jours` : 'N/A',
    modePassation: 'Appel d\'offres',
    objet: fournisseur.objet_ao || 'N/A',
  };

  // Chargement des messages pour le fournisseur sélectionné
  if (fournisseur.id_fournisseur) {
    // Assurez-vous d'avoir une méthode loadMessagesForFournisseur qui gère cette logique
    // this.loadMessagesForFournisseur(fournisseur.id_fournisseur);
  }
}

  /**
   * Adds a new supplier to the 'fournisseurs' table in Supabase.
   * @param form The NgForm for validation.
   */
  async ajouterFournisseur(form: NgForm): Promise<void> {
    if (form.invalid) {
      this.feedbackMessage = 'Please fill in all required fields for the new supplier.';
      this.isError = true;
      return;
    }

    this.loading = true;
    this.feedbackMessage = 'Adding supplier...';
    this.isError = false;
    
    try {
      if (!this.supabaseService.getClient()) {
        throw new Error('Supabase client not initialized for adding.');
      }

      // Insert data into the 'fournisseurs' table
      const { data, error } = await this.supabaseService.getClient()
        .from('fournisseurs')
        .insert({
          nom_entreprise: this.nouveauFournisseur.nom_entreprise,
          ice: this.nouveauFournisseur.ice,
          email_entreprise: this.nouveauFournisseur.email_entreprise,
          telephone_entreprise: this.nouveauFournisseur.telephone_entreprise || null,
          adresse_entreprise: this.nouveauFournisseur.adresse_entreprise || null,
          taxe_pro: this.nouveauFournisseur.taxe_pro || null,
          cnss: this.nouveauFournisseur.cnss || null,
          compte_bancaire: this.nouveauFournisseur.compte_bancaire || null,
          ref_ao: 'AUTO-GENERATED-AO',
          objet_ao: `Manually added supplier: ${this.nouveauFournisseur.nom_entreprise}`,
          total_ttc: 0,
          delai_execution: 0,
          statut: 'Manually added'
        })
        .select();

      if (error) {
        throw error;
      }
       
      if (data && data.length > 0) {
        const newFournisseurData = data[0];
        const newFournisseur: FournisseurSupabase = {
          // Correction ici: on mappe l'ID de la DB (newFournisseurData.id)
          // à la propriété id_fournisseur de notre interface.
          id_fournisseur: newFournisseurData.id,
          numeroAO: newFournisseurData.ref_ao,
          nom_entreprise: newFournisseurData.nom_entreprise,
          ice: newFournisseurData.ice || 'N/A',
          email_entreprise: newFournisseurData.email_entreprise,
          telephone_entreprise: newFournisseurData.telephone_entreprise || 'N/A',
          adresse_entreprise: newFournisseurData.adresse_entreprise || 'N/A',
          compte_bancaire: newFournisseurData.compte_bancaire || 'N/A',
          taxe_pro: newFournisseurData.taxe_pro || 'N/A',
          cnss: newFournisseurData.cnss || 'N/A',
          created_at: newFournisseurData.created_at,
          ref_ao: newFournisseurData.ref_ao || 'N/A',
          objet_ao: newFournisseurData.objet_ao || 'N/A',
          total_ttc: newFournisseurData.total_ttc || 0,
          delai_execution: newFournisseurData.delai_execution,
          statut: newFournisseurData.statut || 'N/A'
        };
        this.fournisseurs.push(newFournisseur);
        // Correction ici: on utilise id_fournisseur
        this.feedbackMessage = `Supplier "${this.nouveauFournisseur.nom_entreprise}" added successfully (ID: ${newFournisseur.id_fournisseur}).`;
        this.isError = false;
        form.resetForm();
        console.log('New supplier added to Supabase:', newFournisseur);
      } else {
        this.feedbackMessage = 'Error: No supplier data returned after insertion.';
        this.isError = true;
      }

    } catch (err: any) {
      console.error('Error adding supplier to Supabase:', err.message || err);
      this.feedbackMessage = `Error adding supplier: ${err.message || 'Unknown error'}`;
      this.isError = true;
    } finally {
      this.loading = false;
    }
  }


  /**
   * Loads message history for a specific supplier from Supabase's 'messages' table.
   * @param fournisseurId The ID of the supplier for whom to load messages.
   */
  async loadMessagesForFournisseur(fournisseurId: string): Promise<void> {
    this.loading = true;
    this.feedbackMessage = 'Loading message history...';
    this.isError = false;
    try {
      if (!this.supabaseService.getClient()) {
        throw new Error('Supabase client not initialized for loading messages.');
      }

      const { data, error } = await this.supabaseService.getClient()
        .from('messages')
        .select('*')
        .eq('fournisseur_id', fournisseurId) // Correction ici: fournisseur_id
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      this.messagesHistory = data.map((msg: any) => ({
        id: msg.id,
        fournisseur_id: msg.fournisseur_id,
        content: msg.content,
        created_at: msg.created_at,
        is_sent_by_admin: msg.is_sent_by_admin
      }));
      console.log(`[DEBUG] Messages loaded for ${fournisseurId}:`, this.messagesHistory);
      this.feedbackMessage = `Message history loaded (${this.messagesHistory.length} messages).`;
      this.isError = false;

    } catch (err: any) {
      this.feedbackMessage = `Error loading messages: ${err.message || 'Unknown error'}`;
      this.isError = true;
      console.error('[DEBUG] Error loading messages:', err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Sends a new general message to the supplier via Supabase.
   */
 async sendMessage(): Promise<void> {
  // 1. Vérification des conditions
  if (!this.messageAttributionContent.trim() || !this.fournisseurSelectionne) {
    this.feedbackMessage = 'Le message ne peut pas être vide et un fournisseur doit être sélectionné.';
    this.isError = true;
    return;
  }
  this.loading = true;
  this.feedbackMessage = 'Envoi en cours...';
  this.isError = false;

  // 2. Déterminer le type de message en se basant sur la décision
  let messageType: 'retenu' | 'non_retenu' | null = null;
  if (this.fournisseurSelectionne.decision?.fournisseur_retenu) {
    messageType = 'retenu';
  } else if (this.fournisseurSelectionne.decision?.fournisseur_non_retenu) {
    messageType = 'non_retenu';
  }

  // 3. Préparer les données pour l'insertion dans Supabase
  const messagePayload = {
    fournisseur_id: this.fournisseurSelectionne.id_fournisseur,
    content: this.messageAttributionContent,
    is_sent_by_admin: true,
  };

  // 4. Exécuter l'insertion dans la table 'messages'
  try {
    const { data, error } = await this.supabaseService.getClient()
      .from('messages')
      .insert(messagePayload)
      .select(); // Le `.select()` est une bonne pratique pour récupérer les données insérées

    if (error) {
      throw error;
    }

    this.feedbackMessage = 'Message envoyé avec succès !';
    this.isError = false;
    this.messageAttributionContent = ''; // Efface le contenu du message après l'envoi
  } catch (err: any) {
    this.feedbackMessage = `Erreur lors de l'envoi du message : ${err.message}`;
    this.isError = true;
  } finally {
    this.loading = false;
  }
}

  /**
   * Sends a specific award message to the supplier via the backend API.
   */
 
     async sendAwardMessageDirectly(): Promise<void> {
  if (!this.newMessageContent.trim() || !this.fournisseurSelectionne) {
    this.feedbackMessage = 'Le message ne peut pas être vide et un fournisseur doit être sélectionné.';
    this.isError = true;
    return;
  }
  try {
    const { data, error } = await this.supabaseService.getClient()
      .from('messages') // Assurez-vous que c'est le bon nom de table
      .insert({
        fournisseur_id: this.fournisseurSelectionne.id_fournisseur,
        content: this.newMessageContent.trim(),
        is_sent_by_admin: true,
        // Ajoutez d'autres champs si nécessaire (ex: timestamp)
      });
    if (error) throw error;

    this.feedbackMessage = 'Message envoyé avec succès directement à Supabase !';
    this.isError = false;
    this.newMessageContent = '';
  } catch (err: any) {
    this.feedbackMessage = `Erreur lors de l'envoi du message : ${err.message}`;
    this.isError = true;
  }
}


  /**
   * Formats a message date for readable display.
   * @param dateString The date string.
   * @returns The formatted date.
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Placeholder functions
  modifierMessage(): void {
    this.feedbackMessage = 'Function "Modify message" to be implemented.';
    this.isError = false;
  }

  joindreDocuments(): void {
    this.feedbackMessage = 'Function "Attach documents" to be implemented.';
    this.isError = false;
  }

  relancerFournisseur(): void {
    this.feedbackMessage = 'Function "Relaunch supplier" to be implemented.';
    this.isError = false;
  }

  telechargerElements(): void {
    this.feedbackMessage = 'Function "Download all elements" to be implemented.';
    this.isError = false;
  }
}