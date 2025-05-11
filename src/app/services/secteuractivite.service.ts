import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SecteurActivite } from '../models/secteuractivite.model';

@Injectable({
  providedIn: 'root',
})
export class SecteurActiviteService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getSecteurActivites(): Observable<SecteurActivite[]> {
    return this.httpClient.get<SecteurActivite[]>(
      `${this.baseUrl}/SecteurActivite/getSecteurActivites`
    );
  }

  private handleError(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      console.error('Client Side Error :', errorResponse.error.message);
    } else {
      console.error('Server Side Error :', errorResponse);
    }
    return throwError(
      'There is a problem with the service. We are notified & working on it. Please try again later.'
    );
  }

  getSecteurActivite(id: number): Observable<any> {
    // console.log("SecteurActivite Id : " + id);
    return this.httpClient
      .get<SecteurActivite>(
        `${this.baseUrl}/SecteurActivite/getSecteurActiviteById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addSecteurActivite(
    secteurActivite: SecteurActivite
  ): Observable<SecteurActivite> {
    return this.httpClient
      .post<SecteurActivite>(
        this.baseUrl + '/SecteurActivite/addSecteurActivite',
        secteurActivite,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateSecteurActivite(
    secteurActivite: SecteurActivite
  ): Observable<SecteurActivite> {
    return this.httpClient
      .put<SecteurActivite>(
        `${this.baseUrl}/SecteurActivite/updateSecteurActivite`,
        secteurActivite,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteSecteurActivite(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/SecteurActivite/deleteSecteurActiviteById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
