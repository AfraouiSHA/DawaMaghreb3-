import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TypePV } from '../models/typepv.model';

@Injectable({
  providedIn: 'root',
})
export class TypePVService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getTypePVs(): Observable<TypePV[]> {
    return this.httpClient.get<TypePV[]>(
      `${this.baseUrl}/TypePV/getTypePVs`
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

  getTypePV(id: number): Observable<any> {
    // console.log("TypePV Id : " + id);
    return this.httpClient
      .get<TypePV>(`${this.baseUrl}/TypePV/getTypePVById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addTypePV(TypePV: TypePV): Observable<TypePV> {
    return this.httpClient
      .post<TypePV>(this.baseUrl + '/TypePV/addTypePV', TypePV, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateTypePV(TypePV: TypePV): Observable<TypePV> {
    return this.httpClient
      .put<TypePV>(`${this.baseUrl}/TypePV/updateTypePV`, TypePV, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteTypePV(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/TypePV/deleteTypePVById/${id}`)
      .pipe(catchError(this.handleError));
  }
}