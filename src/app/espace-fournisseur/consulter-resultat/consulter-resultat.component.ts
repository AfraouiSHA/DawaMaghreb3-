import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-consulter-resultat',
  standalone: true,
  templateUrl: './consulter-resultat.component.html',
  styleUrls: ['./consulter-resultat.component.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class ConsulterResultatComponent {
  confirmationRecu: boolean = false;

  constructor(private firestore: Firestore) {
    this.chargerConfirmation();
  }

  async chargerConfirmation() {
    const ref = doc(this.firestore, 'attributions/AO-2025-009');
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      this.confirmationRecu = snapshot.data()['confirmationRecu'] || false;
    }
  }

  async mettreAJourConfirmation() {
    const ref = doc(this.firestore, 'attributions/AO-2025-009');
    await updateDoc(ref, {
      confirmationRecu: this.confirmationRecu
    });
  }
}


