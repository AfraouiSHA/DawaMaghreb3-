import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase.service';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

// Créez un objet mock pour l'environnement afin de simuler les variables Supabase
const mockEnvironment = {
  supabaseUrl: 'http://localhost:8000', // URL de test pour Supabase
  supabaseKey: 'mock-supabase-key' // Clé de test pour Supabase
};

// Créez un mock du client Supabase lui-même pour éviter les vrais appels réseau pendant les tests
class MockSupabaseClient {
  auth = {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ error: null }),
    signUp: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null })
  };
  storage = {
    from: (bucket: string) => ({
      upload: async (filePath: string, file: File, options?: any) => ({ data: {}, error: null }),
      getPublicUrl: (filePath: string) => ({ data: { publicUrl: `http://mock.url/${bucket}/${filePath}` } })
    })
  };
  from = (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: {}, error: null })
      })
    }),
    update: (updates: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => ({ data: {}, error: null })
        })
      })
    })
  });
}

describe('SupabaseService', () => {
  let service: SupabaseService;
  let mockSupabaseClient: MockSupabaseClient;

  beforeEach(() => {
    // Initialisez le mock du client Supabase
    mockSupabaseClient = new MockSupabaseClient();

    TestBed.configureTestingModule({
      providers: [
        SupabaseService,
        {
          // Fournissez les valeurs mock de l'environnement
          provide: 'environment', // Utilisez le token d'injection correct pour l'environnement si nécessaire, sinon importez directement
          useValue: mockEnvironment
        },
        {
          // Surchargez la fonction createClient pour qu'elle retourne notre mock
          provide: SupabaseClient, // Ou un token plus spécifique si createClient est directement injecté
          useValue: mockSupabaseClient // Fournissez l'instance mock de SupabaseClient
        }
      ]
    });
    service = TestBed.inject(SupabaseService);

    // Si `createClient` est appelé directement dans le constructeur de SupabaseService,
    // il est plus difficile de le mocker. La solution la plus propre est d'injecter `createClient` lui-même.
    // Cependant, dans votre service, `createClient` est appelé directement.
    // L'approche ci-dessus est pour des scénarios où le client est passé en dépendance.
    // Puisque `createClient` est dans le constructeur, nous allons devoir s'assurer que
    // les variables d'environnement sont bien injectées ou que le service est testé d'une manière
    // qui ne déclenche pas le vrai client Supabase.

    // Correction de l'approche : Mocker la fonction `createClient` elle-même
    // car elle est utilisée directement dans le constructeur du service.
    // Il faut utiliser un spyOn pour contrôler son comportement.
    spyOn(require('@supabase/supabase-js'), 'createClient').and.returnValue(mockSupabaseClient as any);

    // Ré-injectez le service après avoir espionné `createClient`
    service = TestBed.inject(SupabaseService);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    // Vérifiez que createClient a été appelé avec les bonnes valeurs
    expect(createClient).toHaveBeenCalledWith(
      mockEnvironment.supabaseUrl,
      mockEnvironment.supabaseKey,
      jasmine.any(Object) // Pour l'objet de configuration 'auth'
    );
  });

  // Vous pouvez ajouter d'autres tests ici pour les méthodes de votre SupabaseService
  // Par exemple:
  // it('should return a supabase client instance', () => {
  //   expect(service.supabase).toBeDefined();
  // });
});
