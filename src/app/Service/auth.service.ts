import { Injectable, OnDestroy } from '@angular/core';
import { SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at?: string;
  nom?: string;
  prenom?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private supabase: SupabaseClient | null = null;
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$: Observable<UserProfile | null> = this.currentUserSubject.asObservable();
  private authStateSubscription: { unsubscribe: () => void } | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.initializeSupabaseClient();
  }

  private async initializeSupabaseClient(): Promise<void> {
    this.supabase = this.supabaseService.supabase;
    if (this.supabase) {
      this.initializeAuthListener();
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        const userProfile = await this.fetchUserProfile(user.id);
        this.currentUserSubject.next(userProfile);
      } else {
        this.currentUserSubject.next(null);
      }
    } else {
      console.error('AuthService: Supabase client non initialisé.');
      this.currentUserSubject.next(null);
    }
  }

  private initializeAuthListener(): void {
    if (!this.supabase) return;
    if (this.authStateSubscription) this.authStateSubscription.unsubscribe();

    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth event:', event, 'Session:', session);
        if (session?.user) {
          const userProfile = await this.fetchUserProfile(session.user.id);
          this.currentUserSubject.next(userProfile);
        } else {
          this.currentUserSubject.next(null);
        }
      }
    );
    this.authStateSubscription = { unsubscribe: () => subscription.unsubscribe() };
  }

  async login(email: string, password: string): Promise<{ error: Error | null }> {
    if (!this.supabase) return { error: new Error('Supabase client non initialisé.') };
    try {
      const { error } = await this.supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error('Erreur login :', error);
      return { error: error as Error };
    }
  }

  async signUp(email: string, password: string): Promise<{ data: any | null; error: Error | null }> {
    if (!this.supabase) return { data: null, error: new Error('Supabase client non initialisé.') };
    try {
      const { data, error } = await this.supabase.auth.signUp({ email, password });
      return { data, error };
    } catch (error) {
      console.error('Erreur signUp :', error);
      return { data: null, error: error as Error };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    if (!this.supabase) return { error: new Error('Supabase client non initialisé.') };
    try {
      const { error } = await this.supabase.auth.signOut();
      if (!error) this.currentUserSubject.next(null);
      return { error };
    } catch (error) {
      console.error('Erreur signOut :', error);
      return { error: error as Error };
    }
  }

  async updateProfileDetails(userId: string, updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: Error | null }> {
    if (!this.supabase) return { data: null, error: new Error('Supabase client non initialisé.') };
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erreur updateProfileDetails :', error);
        return { data: null, error };
      }
      if (this.currentUserSubject.value?.id === userId) {
        this.currentUserSubject.next({ ...this.currentUserSubject.value, ...data });
      }
      return { data: data as UserProfile, error: null };
    } catch (error) {
      console.error('Erreur updateProfileDetails :', error);
      return { data: null, error: error as Error };
    }
  }

  // ------------------------------------------------------------------
  //  GESTION DU PROFIL (avec upsert pour éviter le 409)
  // ------------------------------------------------------------------
  private async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!this.supabase) return null;

    // 1. Lecture
    const { data: profile, error: selErr } = await this.supabase
      .from('profiles')
      .select('id,username,full_name,project_id')
      .eq('id', userId)
      .maybeSingle();

    if (selErr) {
      console.error('[Auth] Erreur SELECT profil :', selErr);
      return null;
    }

    if (profile) {
      console.log('[Auth] Profil trouvé');
      const { data: userResp } = await this.supabase.auth.getUser();
      const u = userResp.user;
      return {
        id: profile.id,
        email: u?.email ?? '',
        role: 'user',
        created_at: u?.created_at ?? '',
        nom: profile.full_name?.split(' ')[0] ?? '',
        prenom: profile.full_name?.split(' ')[1] ?? ''
      };
    }

    // 2. Absent → upsert (évite le 409)
    console.log('[Auth] Profil absent → upsert');
    const { error: upsErr } = await this.supabase
      .from('profiles')
      .upsert(
        { id: userId, username: userId.slice(0, 8), full_name: 'Nouvel Utilisateur' },
        { onConflict: 'id' }
      );
    if (upsErr) {
      console.error('[Auth] ❌ Erreur UPSERT profil :', upsErr);
      return null;
    }
    console.log('[Auth] ✅ Profil upserté');

    // 3. Relire
    return this.fetchUserProfile(userId);
  }

  ngOnDestroy(): void {
    this.authStateSubscription?.unsubscribe();
  }

  get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  getSupabaseClient(): SupabaseClient | null {
    return this.supabase;
  }
}