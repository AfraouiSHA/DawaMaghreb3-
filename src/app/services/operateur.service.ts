import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Operateur } from '../models/operateur.model';

@Injectable({
  providedIn: 'root',
})
export class OperateurService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getOperateurs(): Observable<Operateur[]> {
    return this.httpClient.get<Operateur[]>(
      `${this.baseUrl}/Operateur/getOperateurs`
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

  getOperateur(id: number): Observable<any> {
        return this.httpClient
      .get<Operateur>(`${this.baseUrl}/Operateur/getOperateurById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addOperateur(operateur: Operateur): Observable<Operateur> {
    return this.httpClient
      .post<Operateur>(this.baseUrl + '/Operateur/addOperateur', operateur, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateOperateur(operateur: Operateur): Observable<Operateur> {
    return this.httpClient
      .put<Operateur>(`${this.baseUrl}/Operateur/updateOperateur`, operateur, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteOperateur(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Operateur/deleteOperateurById/${id}`)
      .pipe(catchError(this.handleError));
  }
}
