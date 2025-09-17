// src/main.ts
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';

// 1. Import NÉCESSAIRE pour le DatePipe et les fonctionnalités navigateur de base
import { BrowserModule } from '@angular/platform-browser'; // <-- AJOUTEZ CET IMPORT

// Importations pour la locale française
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import { environment } from './environments/environment';

/* 🔹 ngx-translate */
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

/* 🔹 ngx-toastr */
import { provideToastr } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Enregistrez les données de la locale française pour Angular Pipes
registerLocaleData(localeFr, 'fr');

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    APP_ROUTES, // Si vous utilisez les routes avec provideRouter
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    importProvidersFrom(
      BrowserModule, // <-- AJOUTEZ ICI LE BrowserModule POUR LE SUPPORT DES PIPES COMME DatePipe
      HttpClientModule,
      BrowserAnimationsModule, // Nécessaire pour Toastr et Angular Material
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
    // Aucun fournisseur Firebase nécessaire
  ],
}).catch((err) => {
  console.error('Erreur lors de l\'initialisation de l\'application :', err);
});