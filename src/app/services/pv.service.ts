import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Pv } from '../models/pv.model';

@Injectable({
  providedIn: 'root',
})
export class PvService {
  pv: Pv = new Pv();
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

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

  getAllPvs(): Observable<Pv[]> {
    return this.httpClient.get<Pv[]>(`${this.baseUrl}/Pv/getAllPvs`);
  }

  getPv(id: number): Observable<Pv> {
    return this.httpClient
      .get<Pv>(`${this.baseUrl}/Pv/getPvById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addPv(Pv: Pv): Observable<Pv> {
    return this.httpClient
      .post<Pv>(this.baseUrl + '/Pv/addPv', Pv, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updatePv(Pv: Pv): Observable<Pv> {
    return this.httpClient
      .put<Pv>(`${this.baseUrl}/Pv/updatePv`, Pv, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deletePv(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Pv/deletePvById/${id}`)
      .pipe(catchError(this.handleError));
  }
}
