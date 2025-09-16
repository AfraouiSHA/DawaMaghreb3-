import { Component, OnInit } from '@angular/core'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase.service';
import { PostgrestError } from '@supabase/supabase-js';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-info-ao',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './info-ao.component.html',
  styleUrls: ['./info-ao.component.css']
})
export class InfoAoComponent implements OnInit {
  infoAoForm!: FormGroup;
  appelsOffres: any[] = [];
  loading: boolean = false;
  message: string | null = null;
  messageType: 'success' | 'error' | 'info' = 'success';

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService
  ) { }

  ngOnInit(): void {
    // Initialisation du formulaire
    this.infoAoForm = this.fb.group({
      numeroAO: ['', Validators.required],
      objet: ['', Validators.required],
      dateLimite: ['', Validators.required],
      statut: ['ouvert'] // Tous les nouveaux AO seront "ouverts" par défaut
    });

    // Récupération initiale des AO ouverts
    this.fetchAppelsOffres();
  }

  // 🔹 Récupère uniquement les AO ouverts
  async fetchAppelsOffres(): Promise<void> {
    this.loading = true;

    const { data, error }: { data: any[] | null, error: PostgrestError | null } =
      await this.supabaseService.supabase
        .from('appels_offres')
        .select('*')
        .eq('statut', 'ouvert') // Filtre uniquement les AO ouverts
        .order('dateLimite', { ascending: false });

    this.loading = false;

    if (error) {
      console.error('Erreur lors de la récupération des AO:', error);
      this.showMessage('Erreur lors du chargement de la liste des AO.', 'error');
    } else {
      this.appelsOffres = data || [];
      console.log('Liste des AO chargée:', this.appelsOffres);
      this.showMessage('Liste des AO chargée avec succès.', 'success');
    }
  }

  // 🔹 Soumission du formulaire pour créer un nouvel AO
  async onSubmit(): Promise<void> {
    if (this.infoAoForm.invalid) {
      this.showMessage('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    this.loading = true;
    const formData = this.infoAoForm.value;

    const { data, error }: { data: any[] | null, error: PostgrestError | null } =
      await this.supabaseService.insertData('appels_offres', formData);

    this.loading = false;

    if (error) {
      console.error('Erreur lors de l\'enregistrement de l\'AO:', error);
      this.showMessage('Échec de l\'enregistrement de l\'AO: ' + error.message, 'error');
    } else {
      console.log('Données de l’AO enregistrées avec succès :', data);
      this.showMessage('Informations de l’AO enregistrées avec succès !', 'success');
      this.infoAoForm.reset({ statut: 'ouvert' });
      // Recharger la liste des AO
      await this.fetchAppelsOffres();
    }
  }

  // 🔹 Affiche un message temporaire
  showMessage(msg: string, type: 'success' | 'error' | 'info'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = null, 5000);
  }
}
