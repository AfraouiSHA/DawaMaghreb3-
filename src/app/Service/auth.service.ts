import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

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
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, async (user) => {
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
      const uid = userCredential.user.uid;

      await setDoc(doc(this.firestore, 'users', uid), {
        email,
        role
      });

      const normalizedRole = this.normalizeRole(role);
      this.currentUserSubject.next({ uid, email, role: normalizedRole });
    } catch (error: any) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<UserData | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;
      const userData = await this.loadUserData(uid);
      this.currentUserSubject.next(userData);
      return userData;
    } catch (error: any) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private async loadUserData(uid: string): Promise<UserData | null> {
    const docRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as { email: string; role: string };
      const normalizedRole = this.normalizeRole(data.role);
      return { uid, email: data.email, role: normalizedRole };
    }
    return null;
  }

  private normalizeRole(role: string): string {
    return role
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-zA-Z0-9]/g, '-');   // Remplace les espaces et apostrophes par "-"
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
