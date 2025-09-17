// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, AuthChangeEvent, PostgrestError } from '@supabase/supabase-js';
import { FileOptions } from '@supabase/storage-js';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { v4 as uuidv4 } from 'uuid';
import { PostgrestResponse } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


// Méthode pour télécharger un document depuis Supabase Storage
  downloadDocument(offerId: string, docType: 'administrative' | 'technical'): Observable<Blob> {
    const bucket = 'documents'; // Remplacez par le nom de votre bucket de stockage
    const filePath = `${offerId}/${docType}.pdf`; // Adaptez ce chemin en fonction de votre structure

    return new Observable<Blob>(observer => {
      const getFile = async () => {
        const { data, error } = await this.supabase.storage.from(bucket).download(filePath);
        if (error) {
          observer.error(error);
        } else {
          observer.next(data as Blob);
          observer.complete();
        }
      };
      getFile();
    });
  }


  public supabase: SupabaseClient;
  private _currentUser = new BehaviorSubject<User | null>(null);
  public readonly currentUser$: Observable<User | null> = this._currentUser.asObservable();

  private _authEvents = new BehaviorSubject<AuthChangeEvent | null>(null);
  public readonly authEvents$: Observable<AuthChangeEvent | null> = this._authEvents.asObservable();

  private documentUpdatedSource = new Subject<void>();
  public documentUpdated$ = this.documentUpdatedSource.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.supabase = createClient(
      'https://kfzlkfupyrokfimekkee.supabase.co', // Remplacez par votre URL
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmemxrZnVweXJva2ZpbWVra2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjkxNzEsImV4cCI6MjA2NTk0NTE3MX0.mEn8uE-VQCadB8DCWLXjOp1um0E9ysi0_YhKRUh-lik',     // Remplacez par votre clé
    );
  }
  
public async getDocumentsByProjectIdAndCategory(projectId: string, category: string): Promise<{ data: any[] | null; error: any | null }> {
    if (!this.supabase) {
      console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
      
      return { data: null, error: null };
    }


    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[SupabaseService] Erreur lors de la récupération des documents pour le projet ${projectId} et la catégorie ${category}:`, error.message);
      return { data: null, error };
    }
    return { data, error: null };
  }
 
  async getAllDocuments() {
    return this.supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
  }

   async getPvDetails(documentId: string) {
    return this.supabase
      .from('documents')
      .select(`
        pv_title,
        pv_number,
        pv_date,
        pv_lieu,
        pv_redacteur,
        statut,
        pv_content,
        pv_participants,
        validated_by,
        validated_at,
        electronic_signature
      `)
      .eq('id', documentId)
      .single();
  };
async insertAppelOffre(data: any) {
  const insertData = {
    // Supabase génère automatiquement l'id et created_at
    "numeroAO": data.numeroAO,
    "objet": data.objet,
    "dateLimited": data.dateLimited
  };
  
  return this.supabase
    .from('appels_offres')
    .insert(insertData);
    
}



async ajouterAppelOffre(titre: string, description: string) {
  // Récupérer l'utilisateur actuel
  const {
    data: { user },
    error: userError
  } = await this.supabase.auth.getUser();

  if (userError) {
    console.error('Erreur lors de la récupération de l’utilisateur:', userError);
    return { error: userError };
  }

 const numeroAO = '';
const objet = '';
const dateLimite = '';

const { data, error } = await this.supabase

  .from('appels_offres')
  .insert([{
    numeroAO,
    objet,
    dateLimite,
    user_id: user?.id
  }]);
  if (error) {
    console.error('Erreur lors de l’insertion dans appels_offres:', error);
    return { error };
  }
  return { data };
}

getAppelsOffres() {
  return this.supabase
    .from('appels_offres')
    .select('*');  // réc
    // upère toutes les colonnes
}

  async getAvailableAOs(): Promise<{ data: any[]; error: PostgrestError | null }> {
    const { data, error } = await this.supabase
      .from('appels_offres')
      .select('*')
      .eq('status', 'ouvert');
    return { data: data || [], error };
  }


// Ou mieux, laissez Supabase générer l'id et created_at automatiquement :


 // ✅ Méthode corrigée pour accepter un projectId
  async getAllPvDocuments(projectId: string): Promise<{ data: any[] | null; error: PostgrestError | null }> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('category', 'pv')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des documents PV:', error);
    }
    return { data, error };
  }
 async getLastPvNumber(): Promise<string | null> {
  // ✅ Correction de la requête pour s'assurer qu'elle est bien formée
  const { data, error } = await this.supabase
    .from('documents')
    .select('pv_number')
    .eq('category', 'pv')
    .order('pv_number', { ascending: false })
    .limit(1);
    

  if (error && error.code !== 'PGRST116') { // PGRST116 signifie "pas de résultat trouvé"
    console.error('Erreur lors de la récupération du dernier numéro de PV:', error);
    return null;
  }
  
   if (data && data.length > 0) {
    return data[0].pv_number;
  }
  
  return null;
}


async getCurrentUserProjectId(): Promise<string | null> {
  console.log('Tentative de récupération de l\'utilisateur...');
  const { data: { user }, error } = await this.supabase.auth.getUser();

  if (error || !user) {
    console.error('Erreur Supabase: Impossible de récupérer l\'utilisateur.', error);
    return null;
  }

  console.log('Utilisateur récupéré avec succès:', user.id);

  const { data: profile, error: profileError } = await this.supabase
    .from('profiles')
    .select('id,username,full_name,project_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Erreur Supabase: Impossible de récupérer le profil. Vérifiez les RLS.', profileError);
    return null;
  }

  if (!profile || !profile.project_id) {
    console.warn('Avertissement: Le profil ou project_id est null.', profile);
    return null;
  }

  console.log('ID du projet récupéré:', profile.project_id);
  return profile.project_id;
}
public async getDocumentsByStatusAndCategory(
  projectId: string,
  category: string,
  status: string
): Promise<{ data: any[] | null; error: any | null }> {
  try {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId) // Filtre par l'ID du projet
      .eq('category', category) // Filtre par la catégorie
      .eq('statut', status); // Filtre par le statut

    if (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err: any) {
    console.error('Erreur inattendue:', err);
    return { data: null, error: err };
  }
}













public async getStakeholdersToSign(): Promise<{ data: any[] | null; error: any | null }> {
  console.log('[DEBUG] Requête envoyée :', {
    category: 'pV',
    statut: 'A signer',
    stakeholder: 'maitreouvrage'
  });

  const { data, error } = await this.supabase
    .from('documents')
    .select('*')
    .eq('category', 'pv')               // V majuscule
    .eq('statut', 'À signer')           // sans accent
    .eq('stakeholder', 'maitreOuvrage') // tout en minuscule
    .order('created_at', { ascending: false });

  console.log('[DEBUG] Réponse Supabase :', data);
  if (error) return { data: null, error };
  return { data: data || [], error: null };
}

  async getProjectId(userId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('project_id',)
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('Erreur lors de la récupération de l\'ID du projet:', error);
      return null;
    }
    return data?.project_id || null;
  }

  async ajouterDocument(fileUrl: string) {
    const id = uuidv4();
    const { data, error } = await this.supabase
      .from('documents')
      .insert([
        { id, file_url: fileUrl }
      ]);

    if (error) {
      console.error("Erreur lors de l'insertion :", error);
      return null;
    }

    return data;
  }

  public getSession() {
    return this.supabase.auth.getSession();
  }
  public getUser() {
    return this.supabase.auth.getUser();
  }
  public notifyDocumentUpdated() {
    this.documentUpdatedSource.next();
  }

  public getClient() {
    return this.supabase;
  }

 


public async getFournisseurs() {
    return this.supabase
      .from('fournisseurs')
      .select('nom_entreprise,adresse,email,telephone,ice,cnss,taxe_professionnelle,compte_bancaire,id_fournisseur,total_ht,tva_amount,total_ttc,user_email,devis_data,acceptConditions,numeroAO,documents_techniques,documents_administratifs');
  }


  public async getDocumentById(id: string): Promise<any> {
    return await this.supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
  }
 public async updateDocument(docId: string, data: any): Promise<{ data: any | null; error: any | null }> {
  if (!this.supabase) {
    console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
    return { data: null, error: { message: 'Supabase client not initialized.' } };
  }
  
  try {
    const { data: updatedData, error } = await this.supabase
      .from('documents')
      .update(data)
      .eq('id', docId)
      .select(); // ✅ Utilisez .select() pour retourner les données mises à jour
      
    if (error) {
      console.error(`[SupabaseService] Erreur lors de la mise à jour du document avec l'ID ${docId}:`, error.message);
      return { data: null, error: error };
    }
    
    return { data: updatedData, error: null };
    
  } catch (error: any) {
    console.error(`[SupabaseService] Une erreur inattendue est survenue lors de la mise à jour:`, error.message);
    return { data: null, error: error };
  }
}

 public async getDocument(documentId: string): Promise<{ data: any | null, error: any | null }> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single(); // ⬅️ Utilisez .single()

    if (error && error.code === 'PGRST116') {
      // ⬅️ Gérer l'erreur si aucun document n'est trouvé
      return { data: null, error: null };
    }

    if (error) {
      console.error(`[SupabaseService] Erreur lors de la récupération du document ${documentId}:`, error);
      return { data: null, error: error };
    }

    return { data, error: null };
  }
  /**
   * Récupère des données d'une table spécifique avec des options de filtre.
   * @param tableName Le nom de la table.
   * @param columns Les colonnes à sélectionner (par défaut: '*').
   * @param filters Un objet de filtres pour la requête (ex: { column: 'id', operator: 'eq', value: '123' }).
   * @returns Un objet contenant les données et l'erreur éventuelle.
   */
  async selectData(tableName: string, columns: string = '*', filters: { column: string, operator: string, value: any }[] = []): Promise<PostgrestResponse<any>> {
    let query = this.supabase.from(tableName).select(columns);

    for (const filter of filters) {
      if (filter.operator in query) {
        // Appelle la méthode de filtre correspondante (ex: .eq(), .gt(), etc.)
        query = (query as any)[filter.operator](filter.column, filter.value);
      }
    }
    return query;
  }


  async getAppelOffresByRef(refAO: string) {
  return this.supabase
    .from('appels_offres') // ⚠️ Assurez-vous que ce nom de table est correct
    .select('*')
    .eq('numeroAO', refAO)
    .single(); // Utiliser .single() si vous vous attendez à un seul résultat
}




async getFournisseursForAo(numeroAO: string): Promise<{ data: any[] | null; error: PostgrestError | null }> {
  console.log(`[SupabaseService] Récupération des soumissions pour l'AO avec l'ID: ${numeroAO}`);
  try {
    const { data, error } = await this.supabase
      // Pointage vers la table 'fournisseurs' au lieu de 'soumissions'
      .from('fournisseurs')
      .select(`
        id_fournisseur,
        nom_entreprise,
        total_ttc,
        total_ht,
        tva_amount,
        fichiers_jointes,
        devis_data
      `)
      // Utilisation du filtre sur la clé étrangère
      .eq('numeroAO', numeroAO)
      .order('total_ttc', { ascending: true });

    if (error) {
      console.error('[SupabaseService] Erreur lors de la récupération des soumissions:', error);
      return { data: null, error };
    }
    console.log('[SupabaseService] Soumissions récupérées avec succès:', data);
    return { data: data || [], error: null };
  } catch (err) {
    console.error('[SupabaseService] Erreur inattendue lors de la récupération des soumissions:', err);
    return { data: null, error: { message: 'Une erreur inattendue est survenue.', details: '', hint: '', code: '500' } as PostgrestError };
  }
}

async getOrCreateUserProjectId(userId: string): Promise<string | null> {
  console.log('[Proj] getOrCreateUserProjectId start pour user :', userId);
  // 1. D'abord, on essaie de récupérer le project_id à partir du profil de l'utilisateur
  const { data: profile, error: profileError } = await this.supabase
    .from('profiles')
    .select('project_id')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('[Supabase] Erreur lors de la récupération du profil:', profileError);
  }

  // 2. Si un project_id existe déjà, on le retourne
  if (profile && profile.project_id) {
    console.log('[Supabase] Projet existant trouvé pour l\'utilisateur : ' + userId);
    return profile.project_id;
  }

  // 3. Sinon, on crée un nouveau projet
  console.log('[Supabase] Création d\'un nouveau projet pour l\'utilisateur : ' + userId);
  const newProjectId = uuidv4();
  const { error: projectInsertError } = await this.supabase
    .from('projects')
    .insert([{ id: newProjectId, user_id: userId }]);

  if (projectInsertError) {
    console.error('[Supabase] Erreur lors de la création du projet :', projectInsertError);
    throw new Error('Impossible de créer un nouveau projet.');
  }

  // 4. On met à jour le profil de l'utilisateur avec l'ID du nouveau projet
  const { error: profileUpdateError } = await this.supabase
    .from('profiles')
    .update({ project_id: newProjectId })
    .eq('id', userId);

  if (profileUpdateError) {
    console.error('[Supabase] Erreur lors de la mise à jour du profil :', profileUpdateError);
  }

  console.log('[Supabase] Projet créé et lié avec succès : ' + newProjectId);
  return newProjectId;
}

  // La méthode qui charge les documents du projet
  public async getDocumentsByProjectId(projectId: string, filters: { category?: string, statut?: string }): Promise<any> {
    let query = this.supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.statut) {
      query = query.eq('statut', filters.statut);
    }

    const { data, error } = await query;
    return { data, error };
  }

   async getProjects(): Promise<any> {
    try {
      // Exécute la requête pour sélectionner toutes les lignes de la table 'projects'
      const { data, error } = await this.supabase
        .from('projects')
        .select('*');

      if (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        throw error;
      }

      console.log('Projets récupérés avec succès:', data);
      return data;
    } catch (error) {
      console.error('Une erreur inattendue est survenue:', error);
      return [];
    }
  }
  public async getDocumentsForMaitreOuvrage() {
    return this.supabase.from('documents')
      .select('*');
  }

  public getCurrentUserName(): string {
    const user = this._currentUser.getValue();
    if (user && user.user_metadata && user.user_metadata['full_name']) {
      return user.user_metadata['full_name'];
    }
    return user?.email || 'Inconnu';
  }

  public async updateData(tableName: string, match: any, data: any): Promise<{ data: any | null; error: any | null }> {
    if (!this.supabase) {
      console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
      return { data: null, error: { message: 'Supabase client not initialized.' } };
    }
    try {
      const { data: updatedData, error } = await this.supabase.from(tableName).update(data).match(match).select();
      if (error) throw error;
      return { data: updatedData, error: null };
    } catch (error: any) {
      console.error(`[SupabaseService] Erreur lors de la mise à jour dans ${tableName}:`, error.message);
      return { data: null, error: error };
    }
  }

  /**
   * Récupère le numéro de PV le plus élevé existant.
   * Cette fonction gère le tri des chaînes de caractères "PV-X" en tant que nombres.
   * @returns Le numéro le plus élevé trouvé ou 0 s'il n'y a pas de PV.
   */
  async getLatestPvNumber(): Promise<number> {
  try {
    const { data, error } = await this.supabase
      .from('documents')
      .select('pv_number')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      // Gère le cas où la requête échoue, par exemple à cause d'un problème de RLS.
      // S'il n'y a pas de documents, une erreur sera lancée.
      // Pour ce cas, nous renvoyons 0, ce qui donnera PV-01.
      return 0;
    }

    if (data && data.length > 0 && data[0].pv_number) {
      const latestPvNumberString = data[0].pv_number.split('-').pop();
      const latestPvNumber = parseInt(latestPvNumberString!, 10);
      return isNaN(latestPvNumber) ? 0 : latestPvNumber;
    }

    // Si la requête ne renvoie aucun résultat, cela signifie qu'il n'y a pas de PV
    // dans la table, donc c'est le premier.
    return 0;
  } catch (error: any) {
    console.error('Erreur lors de la récupération du dernier numéro de PV:', error);
    return 0;
  }
}


async getPvToSignForMaitreOuvrage(projectId: string): Promise<{ data: any[] | null; error: any | null }> {
  const { data, error } = await this.supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .eq('category', 'pv')
    .eq('stakeholder', 'maitreOuvrage')
    .eq('statut', 'À signer') // ← filtre clé
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SupabaseService] Erreur PV à signer :', error);
    return { data: null, error };
  }
  return { data: data || [], error: null };
}

async updatePvParticipants(documentId: string, participants: any[]) {
  return this.supabase
    .from('documents')
    .update({ pv_participants: participants })
    .eq('id', documentId);
}

async uploadFile(bucketName: string, filePath: string, file: File): Promise<{ data: any, error: any }> {
  try {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: false }); // Le paramètre est un objet d'options

    if (error) {
      console.error('Erreur lors du téléversement:', error);
      return { data: null, error };
    }

    console.log('Fichier téléversé avec succès. Path:', data.path);
    return { data, error: null };
  } catch (err) {
    console.error('Erreur inattendue lors de l\'upload:', err);
    return { data: null, error: err };
  }
}

  public async deleteFile(bucket: string, filePath: string): Promise<{ data: any, error: any }> {
    if (!this.supabase) {
      console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
      return { data: null, error: { name: 'PostgrestError', code: '500', details: 'Client Supabase non initialisé', hint: '', message: 'Supabase client not initialized.' } };
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .remove([filePath]);

    return { data, error };
  }

  public async deleteDocumentMetadataById(documentId: string): Promise<{ data: any, error: any }> {
    if (!this.supabase) {
      console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
      return { data: null, error: { message: 'Supabase client not initialized.' } };
    }

    const { data, error } = await this.supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    return { data, error };
  }

  public async saveDocumentMetadata(metadata: any): Promise<{ data: any | null, error: any | null }> {
    if (!this.supabase) {
      console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
      return { data: null, error: { message: 'Supabase client not initialized.' } };
    }
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .insert([metadata])
        .select();

      if (error) throw error;
      this.notifyDocumentUpdated();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement des métadonnées :', error.message);
      return { data: null, error };
    }
  }
  public async getPvCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'pv');

    if (error) {
      console.error('Erreur lors du comptage des PV :', error);
      throw error;
    }

    return count || 0;
  }

async updateDocumentStatus(documentId: string, newStatus: string) {
  const { data, error } = await this.supabase
  .from('documents')
  .update({ statut: 'À signer' }) // <-- Correction
  .eq('id', documentId);

  if (error) {
    console.error('Erreur lors de la mise à jour du statut du document:', error);
    return null;
  }
  return data;
}

async createSignedUrl(bucketName: string, filePath: string, expiresIn: number = 60): Promise<string> {
  if (!this.supabase) {
    console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
    return '';
  }

  // Cette méthode ne fait que générer l'URL signée pour un fichier existant.
  // Elle ne téléverse PAS le fichier.
  const { data, error } = await this.supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiresIn);

  if (error || !data?.signedUrl) {
    console.error(`[SupabaseService] Erreur lors de la création de l'URL signée:`, error);
    return '';
  }

  return data.signedUrl;
}
getCurrentUser(): User | null {
  return this._currentUser.getValue();
}

async getAllDocumentsForMaitreOuvrage(userId: string) {
  const { data, error } = await this.supabase
    .from('documents')
    .select('*')
    // Le filtre se fait maintenant sur l'ID de l'utilisateur
    .eq('user_id', userId);

  return { data, error };
}


async getPVToSignForMaitreOuvrage(projectId: string) {
  // Cette méthode récupère tous les documents pour un project_id, 
  // puis filtre par catégorie et statut.
  const { data, error } = await this.supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId) // Filtre par l'ID du projet
    .eq('category', 'pv') // Filtre par catégorie 'pv'
    .eq('statut', 'À signer'); // Filtre par statut 'À signer'

  if (error) {
    console.error('[SupabaseService] Erreur lors de la récupération des PV à signer:', error);
  } else {
    console.log('[SupabaseService] PVs à signer récupérés :', data);
  }

  return { data, error };
}
public async getAppelOffreById(id: string): Promise<{ data: any | null, error: any | null }> {
  const { data, error } = await this.supabase
    .from('appels_offres')
    .select('*')
    .eq('numeroAO', id) 
    .single();

  if (error && error.code === 'PGRST116') {
    return { data: null, error: null };
  }

  if (error) {
    console.error(`[SupabaseService] Erreur lors de la récupération de l'AO avec l'ID ${id}:`, error.message);
    return { data: null, error };
  }
  return { data, error: null };
}
  public async deleteData(tableName: string, match: any): Promise<{ success: boolean; error: any }> {
    if (!this.supabase) {
      console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
      return { success: false, error: { message: 'Supabase client not initialized.' } };
    }
    try {
      const { error } = await this.supabase.from(tableName).delete().match(match);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error(`[SupabaseService] Erreur lors de la suppression dans ${tableName}:`, error.message);
      return { success: false, error: error };
    }
  }

  public getPublicUrl(bucket: string, filePath: string): { data: { publicUrl: string }, error: any } {
    if (!this.supabase) {
      console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
      return { data: { publicUrl: '' }, error: { message: 'Supabase client not initialized.' } };
    }

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(filePath);
    if (!data) {
      console.error('[SupabaseService] Erreur lors de la récupération de l\'URL publique.');
      return { data: { publicUrl: '' }, error: { message: 'Could not get public URL.' } };
    }

    return { data: { publicUrl: data.publicUrl }, error: null };
  }

  public async getData(tableName: string): Promise<any[]> {
    if (!this.supabase) {
      console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
      return [];
    }
    const { data, error } = await this.supabase.from(tableName).select('*');
    if (error) {
      console.error(`[SupabaseService] Erreur lors de la récupération des données de ${tableName}:`, error.message);
      return [];
    }
    return data || [];
  }

  public async insertData(tableName: string, data: any): Promise<{ data: any | null; error: any | null }> {
    if (!this.supabase) {
      console.error('[SupabaseService] Le client Supabase n\'est pas initialisé.');
      return { data: null, error: { message: 'Supabase client not initialized.' } };
    }
    try {
      const { data: insertedData, error } = await this.supabase.from(tableName).insert(data).select();
      if (error) throw error;
      return { data: insertedData, error: null };
    } catch (error: any) {
      console.error(`[SupabaseService] Erreur lors de l'insertion dans ${tableName}:`, error.message);
      return { data: null, error: error };
    }
  }

async getUniqueTenderOffers(): Promise<any> {
    try {
        const { data, error } = await this.supabase
            .from('fournisseurs')
            .select('numeroAO');

        if (error) {
            console.error("Erreur Supabase lors de la récupération des AO :", error);
            return { data: null, error };
        }

        console.log("Données brutes reçues de Supabase :", data);
        return { data, error: null };
    } catch (e) {
        console.error("Erreur inattendue dans getUniqueTenderOffers :", e);
        return { data: null, error: e };
    }
}

async getBidsByTenderRef(ref: string): Promise<any> {
    const { data, error } = await this.supabase
        .from('fournisseurs')
        .select('*') // Récupère toutes les colonnes pour les soumissions
        .eq('numeroAO', ref);

    if (error) {
        console.error("Erreur lors de la récupération des soumissions :", error);
        return { data: null, error };
    }
    return { data, error: null };
}


async insertSoumission(soumissionData: any): Promise<{ data: any | null; error: PostgrestError | null }> {
    console.log('[SupabaseService] Insertion de la soumission dans la table fournisseurs.');
    console.log('[SupabaseService] Données à insérer:', soumissionData);
    console.log('[SupabaseService] Données reçues pour l\'insertion:', soumissionData);
    
    // ✅ C'est la ligne qui manquait et qui est cruciale.
    // Elle prend l'objet soumissionData complet et l'insère dans la table.
    const { data, error } = await this.supabase
        .from('fournisseurs')
        .insert([soumissionData]);

    if (error) {
        console.error('[SupabaseService] Erreur lors de l\'insertion:', error);
    } else {
        console.log('[SupabaseService] Insertion réussie:', data);
    }

    return { data, error };
}
  async getDataByProjectId(projectId: string) {
    return this.supabase
      .from('documents')
      .select('*')
      .eq('project_id', projectId);
  };

  // ✅ AJOUTEZ la nouvelle méthode pour obtenir le dernier numéro de PV
  async getNextPvNumber(): Promise<string> {
    const { data, error } = await this.supabase
      .from('documents') 
      .select('pv_number')
      .eq('category', 'pv') // Filtrer spécifiquement pour la catégorie 'pv'
       .order('pv_number', { ascending: false })
      .order('pv_number', { ascending: false })
       .limit(1);

    if (error || !data || data.length === 0) {
      // Si aucun PV n'est trouvé, on commence par PV-01
      return 'PV-01';
    }

    // Extrait le numéro du dernier PV trouvé (ex: "PV-01" -> 1)
    const lastPvNumber = data[0].pv_number;
    const match = lastPvNumber.match(/PV-(\d+)/);
    let lastNumber = 0;
    if (match && match[1]) {
      lastNumber = parseInt(match[1], 10);
    }
    
    // Incrémente le numéro et le formate
    const nextNumber = lastNumber + 1;
    const formattedNumber = nextNumber.toString().padStart(2, '0');
    
    return `PV-${formattedNumber}`;
  }
}
