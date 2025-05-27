import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';

import { environment } from './environments/environment';

/*  🔹 ngx-translate */
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

/*  🔹 Firebase (v9-modular) */
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

/*  🔹 ngx-toastr */
import { provideToastr } from 'ngx-toastr';

/*  ─── Factory pour ngx-translate ─── */
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/*  ─── Bootstrap stand-alone ─── */
bootstrapApplication(AppComponent, {
  providers: [
    /* Router (stand-alone) */
    APP_ROUTES,

    /* ngx-toastr */
    provideToastr(),

    /* Http + ngx-translate */
    importProvidersFrom(
      HttpClientModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),

    /* Firebase */
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
}).catch((err) =>
  console.error('Erreur lors de l’initialisation de l’application :', err),
);
