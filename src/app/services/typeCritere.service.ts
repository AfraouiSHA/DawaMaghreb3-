import { Injectable } from '@angular/core';
import { TypeCritere } from '../models/typeCritere.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TypeCritereService {
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getTypeCriteres(): Observable<TypeCritere[]> {
    return this.httpClient.get<TypeCritere[]>(
      `${this.baseUrl}/TypeCritere/getTypeCriteres`
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

  getTypeCritere(id: number): Observable<TypeCritere> {
    console.log('################# id' + id);
    return this.httpClient
      .get<TypeCritere>(`${this.baseUrl}/TypeCritere/getTypeCritereById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addTypeCritere(typeCritere: TypeCritere): Observable<TypeCritere> {
    return this.httpClient
      .post<TypeCritere>(this.baseUrl + '/TypeCritere/addTypeCritere', typeCritere, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateTypeCritere(typeCritere: TypeCritere): Observable<TypeCritere> {
    return this.httpClient
      .put<TypeCritere>(`${this.baseUrl}/TypeCritere/updateTypeCritere`, typeCritere, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteTypeCritere(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/TypeCritere/deleteTypeCritereById/${id}`)
      .pipe(catchError(this.handleError));
  }
}
