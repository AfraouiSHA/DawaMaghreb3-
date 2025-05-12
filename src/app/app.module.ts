import { NgModule, OnInit ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core'; 
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatPaginatorIntl,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { RouterModule } from '@angular/router';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatCheckboxModule } from '@angular/material/checkbox';



import { RegisterComponent } from './register/register.component';
import { SignatureElectroniqueComponent } from './Views/signature-electronique/signature-electronique.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { T } from '@angular/cdk/portal-directives.d-BoG39gYN';
import { TelechargementPvComponent } from './telechargement-pv/telechargement-pv.component';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';



@NgModule({
  declarations: [
    
    
  ],
  imports: [
    
    
    
 
  
    SignatureElectroniqueComponent,
    
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
    AppComponent,
    RouterModule,
    TelechargementPvComponent,
   
    FullCalendarModule,
    SweetAlert2Module.forRoot(),
    TranslateModule.forChild(),
    TranslateModule.forRoot({
      
    }),
    
    NoopAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatIconModule,
    RouterModule,
    HighchartsChartModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatCardModule,
    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    provideHttpClient() // Utilisation de provideHttpClient
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
export class ParametragesModule {}
export class SharedModule {}
export class SignatureElectroniqueModule { }