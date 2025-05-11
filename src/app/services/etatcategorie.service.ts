import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EventEmitter } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { EtatCategorie } from '../models/etatcategorie.model';

@Injectable({
  providedIn: 'root',
})
export class EtatCategorieService {
  // baseUrl = environment.baseUrl ;
  etatCateg: EtatCategorie = new EtatCategorie();
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getEtatCategories(): Observable<EtatCategorie[]> {
    return this.httpClient.get<EtatCategorie[]>(
      `${this.baseUrl}/EtatCategorie/getEtatCategories`
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

  getEtatCategorie(id: number): Observable<any> {
    // console.log("Etat Id : " + id);
    return this.httpClient
      .get<EtatCategorie>(`${this.baseUrl}/EtatCategorie/getEtatCategorieById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addEtatCategorie(etatCategorie: EtatCategorie): Observable<EtatCategorie> {
    return this.httpClient
      .post<EtatCategorie>(
        this.baseUrl + '/EtatCategorie/addEtatCategorie',
        etatCategorie,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateEtatCategorie(etatCategorie: EtatCategorie): Observable<EtatCategorie> {
    return this.httpClient
      .put<EtatCategorie>(`${this.baseUrl}/EtatCategorie/updateEtatCategorie`, etatCategorie, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteEtatCategorie(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/EtatCategorie/deleteEtatCategorieById/${id}`)
      .pipe(catchError(this.handleError));
  }
}