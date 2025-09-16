import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdobeSignService } from './adobe-sign.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule // Ne pas utiliser forRoot ici
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'internship-project';

  lang: string = 'fr';
  translations: any;

  constructor(
    private httpClient: HttpClient,
    public translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.translate.setDefaultLang('fr');
  }

  ngOnInit(): void {
    this.lang = localStorage.getItem('lang') || 'fr';
    this.loadStylesAndTranslations(this.lang);
  }

  private loadStylesAndTranslations(lang: string) {
    const head = this.document.head;

    Array.from(head.querySelectorAll('link[data-dynamic-style]')).forEach(link =>
      head.removeChild(link)
    );

    const stylesheets = this.getStylesheetsForLang(lang);

    stylesheets.forEach(href => {
      const link = this.document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = href;
      link.setAttribute('data-dynamic-style', 'true');
      head.appendChild(link);
    });

    const mainIdElement = this.document.getElementById('mainId');
    if (mainIdElement) {
      mainIdElement.style.setProperty('direction', lang === 'fr' ? 'ltr' : 'rtl', 'important');
    }

    this.translate.use(lang);
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
    window.location.reload();
  }
}
