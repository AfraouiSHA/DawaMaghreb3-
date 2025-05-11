import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Evenement } from '../models/evenement.model';

@Injectable({
  providedIn: 'root',
})
export class EvenementService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getEvenements(): Observable<Evenement[]> {
    return this.httpClient.get<Evenement[]>(
      `${this.baseUrl}/Evenement/getEvenements`
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

  getEvenement(id: number): Observable<any> {
    // console.log("evenement Id : " + id);
    return this.httpClient
      .get<Evenement>(
        `${this.baseUrl}/Evenement/getEvenementById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addEvenement(
    evenement: Evenement
  ): Observable<Evenement> {
    return this.httpClient
      .post<Evenement>(
        this.baseUrl + '/Evenement/addEvenement',
        evenement,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateEvenement(
    evenement: Evenement
  ): Observable<Evenement> {
    return this.httpClient
      .put<Evenement>(
        `${this.baseUrl}/Evenement/updateEvenement`,
        evenement,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteEvenement(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/Evenement/deleteEvenementById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
