import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  DocumentSnapshot
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
export interface UserData {
  uid: string;
  email: string | null;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, async (user: FirebaseUser | null) => {
      if (user) {
        const userData = await this.loadUserData(user.uid);
        this.currentUserSubject.next(userData);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async register(email: string, password: string, role: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      if (!user) throw new Error('Utilisateur non créé');

      const uid = user.uid;
      await setDoc(doc(this.firestore, 'users', uid), { email, role });

      const normalizedRole = this.normalizeRole(role);
      this.currentUserSubject.next({ uid, email, role: normalizedRole });
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription :', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<UserData | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      if (!user) throw new Error('Connexion impossible');

      const userData = await this.loadUserData(user.uid);
      this.currentUserSubject.next(userData);
      return userData;
    } catch (error: any) {
      console.error('Erreur de connexion :', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion :', error);
      throw error;
    }
  }

  private async loadUserData(uid: string): Promise<UserData | null> {
    try {
      const docRef = doc(this.firestore, 'users', uid);
      const docSnap: DocumentSnapshot = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as { email: string; role: string };
        const normalizedRole = this.normalizeRole(data.role);
        return { uid, email: data.email, role: normalizedRole };
      }

      return null;
    } catch (error: any) {
      console.error('Erreur lors du chargement des données utilisateur :', error);
      return null;
    }
  }

  private normalizeRole(role: string): string {
    return role
      .trim()
      .toLowerCase()
      .normalize('NFD') // Normalisation des caractères Unicode
      .replace(/[\u0300-\u036f]/g, '') // Suppression des accents
      .replace(/[^a-zA-Z0-9]/g, '-');  // Remplace les caractères spéciaux par "-"
  }

  getCurrentUser(): UserData | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string {
    return this.currentUserSubject.value?.role || '';
  }

  setCurrentUser(userData: UserData): void {
    this.currentUserSubject.next(userData);
  }
}

