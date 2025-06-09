import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule],
})
export class AppComponent implements OnInit {
  title = 'internship-project';

  lang: string = 'fr'; // type string au lieu de any
  translations: any;

  constructor(
    private httpClient: HttpClient,
    public translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.translate.setDefaultLang('fr');
  }

  ngOnInit(): void {
    this.lang = localStorage.getItem('lang') || 'fr'; // Valeur par défaut 'fr'
    this.loadStylesAndTranslations(this.lang);
  }

  private loadStylesAndTranslations(lang: string) {
    const head = this.document.head;

    // Nettoyer les liens css déjà insérés (optionnel)
    Array.from(head.querySelectorAll('link[data-dynamic-style]')).forEach(link =>
      head.removeChild(link)
    );

    const stylesheets = this.getStylesheetsForLang(lang);

    stylesheets.forEach(href => {
      const link = this.document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = href;
      link.setAttribute('data-dynamic-style', 'true'); // pour nettoyage futur
      head.appendChild(link);
    });

    const mainIdElement = this.document.getElementById('mainId');
    if (mainIdElement) {
      mainIdElement.style.setProperty('direction', lang === 'fr' ? 'ltr' : 'rtl', 'important');
    }

    const i18nFile = lang === 'fr' ? 'assets/i18n/fr.json' : 'assets/i18n/ar.json';
    this.httpClient.get(i18nFile).subscribe(data => {
      console.log('Translations loaded:', data);
      this.translations = data;
      this.translate.use(lang);
    });
  }

  private getStylesheetsForLang(lang: string): string[] {
    if (lang === 'fr') {
      return [
        'assets/vendors/styles/core.css',
        'assets/vendors/styles/icon-font.min.css',
        'assets/src/plugins/datatables/css/dataTables.bootstrap4.min.css',
        'assets/src/plugins/datatables/css/responsive.bootstrap4.min.css',
        'assets/vendors/styles/style.css',
      ];
    } else {
      return [
        'assets/vendors/styles/coreAr.css',
        'assets/vendors/styles/icon-fontAr.min.css',
        'assets/src/plugins/datatables/css/dataTablesAr.bootstrap4.min.css',
        'assets/src/plugins/datatables/css/responsiveAr.bootstrap4.min.css',
        'assets/vendors/styles/styleAr.css',
      ];
    }
  }

  changeLang(event: any) {
    const selectedLang = event.target.value;
    console.log('Language changed to:', selectedLang);
    localStorage.setItem('lang', selectedLang);
    // Option 1 : reload page pour recharger tout (comme avant)
    window.location.reload();

    // Option 2 : ou mieux, charger dynamiquement sans reload
    // this.loadStylesAndTranslations(selectedLang);
  }
}
