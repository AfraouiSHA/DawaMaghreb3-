import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Lettre } from '../models/lettre.model';

@Injectable({
  providedIn: 'root',
})
export class LettreService {
  lettre: Lettre = new Lettre();
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

  getAllLettres(): Observable<Lettre[]> {
    return this.httpClient.get<Lettre[]>(
      `${this.baseUrl}/Lettre/getAllLettres`
    );
  }

  getLettre(reference: number): Observable<Lettre> {
    return this.httpClient
      .get<Lettre>(`${this.baseUrl}/Lettre/getLettreByReference/${reference}`)
      .pipe(catchError(this.handleError));
  }

  addLettre(Lettre: Lettre): Observable<Lettre> {
    return this.httpClient
      .post<Lettre>(this.baseUrl + '/Lettre/addLettre', Lettre, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateLettre(Lettre: Lettre): Observable<Lettre> {
    return this.httpClient
      .put<Lettre>(`${this.baseUrl}/Lettre/updateLettre`, Lettre, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteLettre(reference: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Lettre/deleteLettreByReference/${reference}`)
      .pipe(catchError(this.handleError));
  }
}
