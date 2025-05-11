import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Critere } from '../models/critere.model';

@Injectable({
  providedIn: 'root',
})
export class CritereService {
  critere: Critere = new Critere();
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

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

  getAllCriteres(): Observable<Critere[]> {
    return this.httpClient.get<Critere[]>(`${this.baseUrl}/Critere/getCriteres`);
  }

  getCritere(id: number): Observable<Critere> {
    return this.httpClient
      .get<Critere>(`${this.baseUrl}/Critere/getCritereById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addCritere(critere: Critere): Observable<Critere> {
    return this.httpClient
      .post<Critere>(this.baseUrl + '/Critere/addCritere', critere, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateCritere(critere: Critere): Observable<Critere> {
    return this.httpClient
      .put<Critere>(`${this.baseUrl}/Critere/updateCritere`, critere, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteCritere(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Critere/deleteCritereById/${id}`)
      .pipe(catchError(this.handleError));
  }
}