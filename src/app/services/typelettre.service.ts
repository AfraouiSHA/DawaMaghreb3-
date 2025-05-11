import { Injectable } from '@angular/core';
import { TypeCritere } from '../models/typeCritere.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { TypeLettre } from '../models/typelettre.model';

@Injectable({
  providedIn: 'root',
})
export class TypeLettreService {
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getAllTypeLettres(): Observable<TypeLettre[]> {
    return this.httpClient.get<TypeLettre[]>(
      `${this.baseUrl}/TypeLettre/getTypeLettres`
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

  getTypeLettre(id: number): Observable<TypeLettre> {
    console.log('################# id' + id);
    return this.httpClient
      .get<TypeLettre>(`${this.baseUrl}/TypeLettre/getTypeLettreById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addTypeLettre(typeLettre: TypeLettre): Observable<TypeLettre> {
    return this.httpClient
      .post<TypeLettre>(this.baseUrl + '/TypeLettre/addTypeLettre', typeLettre, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateTypeLettre(typeLettre: TypeLettre): Observable<TypeLettre> {
    return this.httpClient
      .put<TypeLettre>(`${this.baseUrl}/TypeLettre/updateTypeLettre`, typeLettre, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteTypeLettre(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/TypeLettre/deleteTypeLettreById/${id}`)
      .pipe(catchError(this.handleError));
  }
}
