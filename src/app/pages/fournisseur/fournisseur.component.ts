import { Component, OnInit } from '@angular/core';
import { Router ,RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common'; // nécessaire pour le pipe date
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';

@Component({
  selector: 'app-fournisseur',
  standalone: true, // rend le composant standalone
  imports: [CommonModule,RouterModule],
  templateUrl: './fournisseur.component.html',
  styleUrls: ['./fournisseur.component.css']
})
export class FournisseurComponent implements OnInit {
  availableAOs: any[] = [];
  userId: string = '...'; // ID du fournisseur connecté
  supabase: SupabaseClient; // Client Supabase
  id_fournisseur: string = 'id_fournisseur';

  constructor(private router: Router) {
    // 🔑 Initialisation du client Supabase avec URL et clé API
    this.supabase = createClient(
      'https://kfzlkfupyrokfimekkee.supabase.co', // URL Supabase
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmemxrZnVweXJva2ZpbWVra2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjkxNzEsImV4cCI6MjA2NTk0NTE3MX0.mEn8uE-VQCadB8DCWLXjOp1um0E9ysi0_YhKRUh-lik' // Clé API
    );
  }

  ngOnInit(): void {
    this.loadAvailableAOsForSupplier(this.userId);
  }

  async loadAvailableAOsForSupplier(id_fournisseur: string) {
    try {
      const { data, error }: { data: any[] | null; error: PostgrestError | null } = await this.supabase
        .from('appels_offres')
        .select('*')
        .eq('statut', 'ouvert') // nom exact de la colonne dans Supabase
        .order('dateLimite', { ascending: true });

      if (error) {
        console.error('Erreur récupération AO pour fournisseur :', error);
        return;
      }

      this.availableAOs = data || [];
      console.log('Liste des AO récupérée :', this.availableAOs);
    } catch (err) {
      console.error('Erreur inattendue lors de la récupération des AO :', err);
    }
  }

  getAlreadySubmittedAoIds(userId: string): string[] {
    // TODO : retourner les IDs des AO déjà soumis par ce fournisseur
    return [];
  }

  // ✅ Navigation vers Soumission
  allerASoumission(aoId: string) {
    console.log('Redirection vers la page Soumission pour AO:', aoId);
    this.router.navigate(['/soumission', aoId]);
  }

  // ✅ Navigation vers Consulter Résultat
  allerAConsulterResultat() {
    console.log('Redirection vers la page Consulter Résultat');
    this.router.navigate(['/id_fournisseur/consulter-resultat']);
  }
}
