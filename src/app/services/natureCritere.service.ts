import { Injectable } from '@angular/core';
import { NatureCritere } from '../models/natureCritere.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NatureCritereService {
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getNatureCriteres(): Observable<NatureCritere[]> {
    return this.httpClient.get<NatureCritere[]>(
      `${this.baseUrl}/NatureCritere/getNatureCriteres`
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

  getNatureCritere(id: number): Observable<NatureCritere> {
    console.log('################# id' + id);
    return this.httpClient
      .get<NatureCritere>(
        `${this.baseUrl}/NatureCritere/getNatureCritereById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addNatureCritere(natureCritere: NatureCritere): Observable<NatureCritere> {
    return this.httpClient
      .post<NatureCritere>(
        this.baseUrl + '/NatureCritere/addNatureCritere',
        natureCritere,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateNatureCritere(natureCritere: NatureCritere): Observable<NatureCritere> {
    return this.httpClient
      .put<NatureCritere>(
        `${this.baseUrl}/NatureCritere/updateNatureCritere`,
        natureCritere,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteNatureCritere(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/NatureCritere/deleteNatureCritereById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
