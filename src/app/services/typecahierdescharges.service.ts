import { Injectable } from '@angular/core';
import { TypeCahierDesCharges } from '../models/typecahierdescharges.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TypeCahierDesChargesService {
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getAllTypeCahierDesCharges(): Observable<TypeCahierDesCharges[]> {
    return this.httpClient.get<TypeCahierDesCharges[]>(
      `${this.baseUrl}/TypeCahierDesCharges/getTypeCahierDesCharges`
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

  getTypeCahierDesCharges(id: number): Observable<TypeCahierDesCharges> {
    console.log('################# id' + id);
    return this.httpClient
      .get<TypeCahierDesCharges>(
        `${this.baseUrl}/TypeCahierDesCharges/getTypeCahierDesChargesById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addTypeCahierDesCharges(
    TypeCahierDesCharges: TypeCahierDesCharges
  ): Observable<TypeCahierDesCharges> {
    return this.httpClient
      .post<TypeCahierDesCharges>(
        this.baseUrl + '/TypeCahierDesCharges/addTypeCahierDesCharges',
        TypeCahierDesCharges,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateTypeCahierDesCharges(
    TypeCahierDesCharges: TypeCahierDesCharges
  ): Observable<TypeCahierDesCharges> {
    return this.httpClient
      .put<TypeCahierDesCharges>(
        `${this.baseUrl}/TypeCahierDesCharges/updateTypeCahierDesCharges`,
        TypeCahierDesCharges,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteTypeCahierDesCharges(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/TypeCahierDesCharges/deleteTypeCahierDesChargesById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
