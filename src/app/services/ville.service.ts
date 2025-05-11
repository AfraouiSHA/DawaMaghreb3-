import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Ville } from '../models/villes.model';

@Injectable({
  providedIn: 'root',
})
export class VilleService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getVilles(): Observable<Ville[]> {
    return this.httpClient.get<Ville[]>(
      `${this.baseUrl}/Ville/getVilles`
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

  getVille(id: number): Observable<any> {
    // console.log("Ville Id : " + id);
    return this.httpClient
      .get<Ville>(`${this.baseUrl}/Ville/getVilleById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addVille(ville: Ville): Observable<Ville> {
    return this.httpClient
      .post<Ville>(this.baseUrl + '/Ville/addVille', ville, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateVille(ville: Ville): Observable<Ville> {
    return this.httpClient
      .put<Ville>(`${this.baseUrl}/Ville/updateVille`, ville, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteVille(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Ville/deleteVilleById/${id}`)
      .pipe(catchError(this.handleError));
  }
}