import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Fonction } from '../models/fonction.model';

@Injectable({
  providedIn: 'root',
})
export class FonctionService {
  fonction: Fonction = new Fonction();
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

  getAllFonctions(): Observable<Fonction[]> {
    return this.httpClient.get<Fonction[]>(
      `${this.baseUrl}/Fonction/getFonctions`
    );
  }

  getFonction(id: number): Observable<Fonction> {
    return this.httpClient
      .get<Fonction>(
        `${this.baseUrl}/Fonction/getFonctionById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addFonction(
    Fonction: Fonction
  ): Observable<Fonction> {
    return this.httpClient
      .post<Fonction>(
        this.baseUrl + '/Fonction/addFonction',
        Fonction,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateFonction(
    Fonction: Fonction
  ): Observable<Fonction> {
    return this.httpClient
      .put<Fonction>(
        `${this.baseUrl}/Fonction/updateFonction`,
        Fonction,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteFonction(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/Fonction/deleteFonctionById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
