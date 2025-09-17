// src/app/remplir-information/remplir-information.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { firstValueFrom } from 'rxjs';

// Interface pour les participants
interface Participant {
  nom: string;
  nombre: number;
}

// Interface pour les données du PV
interface PvDocument {
  id: string;
  pv_title: string;
  pv_number: string;
  pv_date: string;
  pv_lieu: string;
  pv_redacteur: string;
  statut: string;
  pv_participants: Participant[];
  category: string;
}

@Component({
  selector: 'app-remplir-information',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './remplir-information.component.html',
  styleUrls: ['./remplir-information.component.css']
})
export class RemplirInformationComponent implements OnInit {
  documentId: string | null = null;
  pvTitle = '';
  pvNumber = '';
  pvDate = '';

  pvLocation = '';
  pvRedacteur = '';
  pvStatus = ''; // Initialiser le statut

  participants: Participant[] = [{ nom: '', nombre: 0 }];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.documentId = params.get('id');
      if (this.documentId) {
        this.loadDocumentDetails();
      }
    });
  }

  async loadDocumentDetails(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.getDocumentById(this.documentId!);
      if (error) {
        throw error;
      }
      if (data) {
        this.pvTitle = data.pv_title || data.file_name;
        this.pvNumber = data.pv_number || 'Non spécifié';
        this.pvDate = data.pv_date;
        this.pvLocation = data.pv_lieu;
        this.pvRedacteur = data.pv_redacteur;
        this.pvStatus = data.statut || 'En attente'; // Gérer l'état initial
        this.participants = data.pv_participants || [{ nom: '', nombre: 0 }];
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des informations du document :', error);
    }
  }

  addParticipant(): void {
    this.participants.push({ nom: '', nombre: 0 });
  }

  removeParticipant(index: number): void {
    this.participants.splice(index, 1);
  }

  async sauvegarderPv(): Promise<void> {
    // S'assurer que les champs obligatoires sont remplis avant la sauvegarde
    if (!this.pvTitle || !this.pvNumber || !this.pvDate || !this.pvLocation || !this.pvRedacteur) {
        console.error('Veuillez remplir tous les champs obligatoires.');
        // TODO: Afficher une modale d'erreur à l'utilisateur
        return;
    }

    const participantsData = this.participants.map(p => {
        return { nom: p.nom, nombre: p.nombre || 0 };
    }).filter(p => p.nom.trim() !== '');

    const dataToSave = {
      pv_title: this.pvTitle,
      pv_number: this.pvNumber,
      pv_date: this.pvDate,
      pv_lieu: this.pvLocation,
      pv_redacteur: this.pvRedacteur,
      // Définit le statut de manière cohérente pour la base de données
      statut: 'À signer',
      pv_participants: participantsData,
      category: 'pv',
    };

    try {
      const { data, error } = await this.supabaseService.updateDocument(this.documentId!, dataToSave);

      if (error) {
        console.error('Erreur lors de la sauvegarde du PV :', error);
        // TODO: Afficher une modale d'erreur à l'utilisateur
   } else {
            console.log('PV sauvegardé avec succès !', data);
            // TODO: AFFICHER UN MESSAGE DE SUCCÈS À L'UTILISATEUR
            // Ne pas ajouter de ligne de redirection (this.router.navigate) ici.
        }
    } catch (err: any) {
        console.error('Erreur inattendue lors de la sauvegarde :', err.message);
    }
  }
}
