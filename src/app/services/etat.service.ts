import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Etat } from '../models/etat.model';
import { EventEmitter } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { EtatCategorie } from '../models/etatcategorie.model';

@Injectable({
  providedIn: 'root',
})
export class EtatService {
  // baseUrl = environment.baseUrl ;
  etat: Etat = new Etat();
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getEtats(): Observable<Etat[]> {
    return this.httpClient.get<Etat[]>(
      `${this.baseUrl}/Etat/getEtats`
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

  getEtat(id: number): Observable<any> {
    // console.log("Etat Id : " + id);
    return this.httpClient
      .get<Etat>(`${this.baseUrl}/Etat/getEtatById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addEtat(Etat: Etat): Observable<Etat> {
    return this.httpClient
      .post<Etat>(
        this.baseUrl + '/Etat/addEtat',
        Etat,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateEtat(Etat: Etat): Observable<Etat> {
    return this.httpClient
      .put<Etat>(`${this.baseUrl}/Etat/updateEtat`, Etat, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteEtat(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Etat/deleteEtatById/${id}`)
      .pipe(catchError(this.handleError));
  }
  getEtatsByCategorie(libelle:string): Observable<Etat[]> {
    return this.httpClient.get<Etat[]>(
      `${this.baseUrl}/Etat/getEtats/ByEtatCategorieLibelle/${libelle}`
    );
  }
  }