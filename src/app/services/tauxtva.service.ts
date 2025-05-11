import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TauxTVA } from '../models/tauxtva.model';

@Injectable({
  providedIn: 'root',
})
export class TauxTVAService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getTauxTVAs(): Observable<TauxTVA[]> {
    return this.httpClient.get<TauxTVA[]>(
      `${this.baseUrl}/TauxTVA/getTauxTVAs`
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

  getTauxTVA(id: number): Observable<any> {
    // console.log("TauxTVA Id : " + id);
    return this.httpClient
      .get<TauxTVA>(`${this.baseUrl}/TauxTVA/getTauxTVAById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addTauxTVA(TauxTVA: TauxTVA): Observable<TauxTVA> {
    return this.httpClient
      .post<TauxTVA>(this.baseUrl + '/TauxTVA/addTauxTVA', TauxTVA, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateTauxTVA(TauxTVA: TauxTVA): Observable<TauxTVA> {
    return this.httpClient
      .put<TauxTVA>(`${this.baseUrl}/TauxTVA/updateTauxTVA`, TauxTVA, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteTauxTVA(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/TauxTVA/deleteTauxTVAById/${id}`)
      .pipe(catchError(this.handleError));
  }
}