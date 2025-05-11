import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { InjectFlags } from '@angular/core';
import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,  
  imports: [RouterModule,],
  
})
export class AppComponent implements OnInit {
  title = 'internship-project';

  lang: any;
  fr: any;

  constructor(
    private httpClient: HttpClient,
    public translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.translate.setDefaultLang('fr');
  }
  ngOnInit(): void {
    this.lang = localStorage.getItem('lang');
    // this.lang = localStorage.getItem('lang') || 'fr';

    let HeadTag = this.document.getElementsByTagName(
      'head'
    )[0] as HTMLHeadElement;

    let newlink;

    if (this.lang == 'fr') {
      newlink = this.document.createElement('link');
      newlink.rel = 'stylesheet';
      newlink.type = 'text/css';
      newlink.href = 'assets/vendors/styles/core.css';
      HeadTag.appendChild(newlink);

      newlink = this.document.createElement('link');
      newlink.rel = 'stylesheet';
      newlink.type = 'text/css';
      newlink.href = 'assets/vendors/styles/icon-font.min.css';
      HeadTag.appendChild(newlink);

      newlink = this.document.createElement('link');
      newlink.rel = 'stylesheet';
      newlink.type = 'text/css';
      newlink.href =
        'assets/src/plugins/datatables/css/dataTables.bootstrap4.min.css';
      HeadTag.appendChild(newlink);

      newlink = this.document.createElement('link');
      newlink.rel = 'stylesheet';
      newlink.type = 'text/css';
      newlink.href =
        'assets/src/plugins/datatables/css/responsive.bootstrap4.min.css';
      HeadTag.appendChild(newlink);

      newlink = this.document.createElement('link');
      newlink.rel = 'stylesheet';
      newlink.type = 'text/css';
      newlink.href = 'assets/vendors/styles/style.css';
      HeadTag.appendChild(newlink);

      document
        .getElementById('mainId')
        ?.setAttribute('style', 'direction: ltr !important;');
      /* //document.getElementById("sidebar-menu")?.setAttribute("style", "right: 0px; left:10px ;");
 
      const iconElement=document.getElementsByClassName('micon') ; 
      for(let i=0; i<iconElement.length; i++) {
        
        iconElement[i].setAttribute("style", "right: 0px; left:10px ;");
      }
*/

      this.httpClient.get('assets/i18n/fr.json').subscribe((data) => {
        console.log(data);
        this.fr = data;
      });
    } else {
      newlink = this.document.createElement('link');
      newlink.rel = 'stylesheet';
      newlink.type = 'text/css';
      newlink.href = 'assets/vendors/styles/coreAr.css';
      HeadTag.appendChild(newlink);

      newlink = this.document.createElement('link');
      newlink.rel = 'stylesheet';
      newlink.type = 'text/css';
      newlink.href = 'assets/vendors/styles/icon-fontAr.min.css';
      HeadTag.appendChild(newlink);

      newlink = this.document.createElement('link');
      newlink.rel = 'stylesheet';
      newlink.type = 'text/css';
      newlink.href =
        'assets/src/plugins/datatables/css/dataTablesAr.bootstrap4.min.css';
      HeadTag.appendChild(newlink);

      newlink = this.document.createElement('link');
      newlink.rel = 'stylesheet';
      newlink.type = 'text/css';
      newlink.href =
        'assets/src/plugins/datatables/css/responsiveAr.bootstrap4.min.css';
      HeadTag.appendChild(newlink);

      newlink = this.document.createElement('link');
      newlink.rel = 'stylesheet';
      newlink.type = 'text/css';
      newlink.href = 'assets/vendors/styles/styleAr.css';
      HeadTag.appendChild(newlink);
      document
        .getElementById('mainId')
        ?.setAttribute('style', 'direction: rtl !important;');

      /*
      document.getElementById("header")?.setAttribute("style", "left: 0 ; right:auto ; ");
      document.getElementById("sideBar")?.setAttribute("style", "right: 0; left:auto ;");
      document.getElementById("mainContainer")?.setAttribute("style", "padding: 80px 300px 2px 20px;");

       document.getElementById("sidebar-menu")?.setAttribute("style", "right: 10px !important; left:0px !important ;");


      const iconElement=document.getElementsByClassName('micon') ; 
      for(let i=0; i<iconElement.length; i++) {
        
        iconElement[i].setAttribute("style", "right: 10px !important; left:0px !important ;");
      }*/

      this.httpClient.get('assets/i18n/ar.json').subscribe((data) => {
        console.log(data);
        this.fr = data;
      });
    }
  }

  changeLang(lang: any) {
    console.log(lang.target.value);
    localStorage.setItem('lang', lang.target.value);
    window.location.reload();
  }
}
