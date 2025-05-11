import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EvenementType } from '../models/evenementtype.model';

@Injectable({
  providedIn: 'root',
})
export class EvenementTypeService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getEvenementTypes(): Observable<EvenementType[]> {
    return this.httpClient.get<EvenementType[]>(
      `${this.baseUrl}/EvenementType/getEvenementTypes`
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

  getEvenementType(id: number): Observable<any> {
    // console.log("evenementType Id : " + id);
    return this.httpClient
      .get<EvenementType>(
        `${this.baseUrl}/EvenementType/getEvenementTypeById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addEvenementType(
    evenementType: EvenementType
  ): Observable<EvenementType> {
    return this.httpClient
      .post<EvenementType>(
        this.baseUrl + '/EvenementType/addEvenementType',
        evenementType,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateEvenementType(
    evenementType: EvenementType
  ): Observable<EvenementType> {
    return this.httpClient
      .put<EvenementType>(
        `${this.baseUrl}/EvenementType/updateEvenementType`,
        evenementType,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteEvenementType(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/EvenementType/deleteEvenementTypeById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
