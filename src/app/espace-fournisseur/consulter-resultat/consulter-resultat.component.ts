import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';

/* ---------- Interfaces ---------- */
interface Message {
  id: number;
  created_at: string;
  id_fournisseur: string;
  content: string;
  is_sent_by_admin: boolean;
  type_message?: 'retenu' | 'non_retenu' | null;
}

interface Fournisseur {
  id_fournisseur: string;
  nom_entreprise: string;
  email: string;
  telephone?: string;
  adresse?: string;
  compte_bancaire?: string;
  taxe_professionnelle: string;
  ice: string;
  cnss: string;
  ref_ao: string;
  objet: string;
  delai_execution: number;
  statut?: string;
}

interface AppelOffre {
  id_appel: number;
  numeroAO: string;
  objet: string;
  delai_execution: number;
  dateLimite: string;
  statut: string;
}

/* ---------- Component ---------- */
@Component({
  selector: 'app-consulter-resultat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './consulter-resultat.component.html',
  styleUrls: ['./consulter-resultat.component.css']
})
export class ConsulterResultatComponent implements OnInit {
  messages: Message[] = [];
  fournisseur: Fournisseur | null = null;
  appelOffre: AppelOffre | null = null;
  loading = false;
  errorMessage = '';
  confirmationRecue = false;
  confirmationMessage = '';
  isConfirmationError = false;

  fournisseurId: string | null = null;

  constructor(private supabaseService: SupabaseService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id_fournisseur');
      if (id) {
        this.fournisseurId = id;
        this.loadMessages();
      } else {
        this.errorMessage = "L'ID du fournisseur est manquant.";
      }
    });
  }

  async loadMessages(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    if (!this.fournisseurId) return;

    try {
      const supabase = this.supabaseService.getClient();

      // 1. Messages
      const { data: msgData, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .eq('id_fournisseur', this.fournisseurId)
        .order('created_at', { ascending: false });

      if (msgErr) throw msgErr;
      this.messages = msgData as Message[];

      if (this.messages.length === 0) return;

      const msg = this.messages[0];

      // 2. Fournisseur
      const { data: f, error: fErr } = await supabase
        .from('fournisseurs')
        .select('*')
        .eq('id_fournisseur', this.fournisseurId)
        .single();
      if (!fErr) this.fournisseur = f as Fournisseur;

      // 3. Appel d’offres
      if (this.fournisseur?.ref_ao) {
        const { data: ao, error: aoErr } = await supabase
          .from('appels_offres')
          .select('*')
          .eq('numeroAO', this.fournisseur.ref_ao)
          .single();
        if (!aoErr) this.appelOffre = ao as AppelOffre;
      }
    } catch (err: any) {
      this.errorMessage = `Erreur : ${err.message}`;
    } finally {
      this.loading = false;
    }
    console.log('🔗 ref_ao du fournisseur :', this.fournisseur?.ref_ao);
console.log('📦 Résultat appelOffre :', this.appelOffre);
  }

  formatDate(isoString: string, addDays = 0): string {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    date.setDate(date.getDate() + addDays);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Handles message reception confirmation.
   */
  async confirmerReception(): Promise<void> {
    const latestMessage = this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;

    if (!latestMessage || !this.fournisseurId) {
      this.isConfirmationError = true;
      this.confirmationMessage = 'Impossible de confirmer : les informations sont incomplètes.';
      return;
    }
    this.confirmationMessage = '';
    this.isConfirmationError = false;

    const supabaseClient = this.supabaseService.getClient();
    if (!supabaseClient) {
      this.isConfirmationError = true;
      this.confirmationMessage = 'Erreur: Le service Supabase est manquant ou non initialisé.';
      return;
    }
    
    try {
      const { error } = await supabaseClient
        .from('confirmations')
        .upsert(
          {
            message_id: latestMessage.id,
            fournisseur_id: this.fournisseurId,
            read: true,
            timestamp: new Date().toISOString()
          },
          { onConflict: 'message_id' }
        );

      if (error) {
        throw error;
      }

      this.confirmationMessage = 'Message confirmé avec succès.';
      this.confirmationRecue = true;
    } catch (err: any) {
      console.error('Erreur lors de la confirmation de réception via Supabase:', err);
      this.isConfirmationError = true;
      this.confirmationMessage = 'Erreur lors de la confirmation de réception via Supabase.';
    }
  }
}
