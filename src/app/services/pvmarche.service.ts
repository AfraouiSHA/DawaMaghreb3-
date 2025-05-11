import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PvMarche } from '../models/pvmarche.model';

@Injectable({
  providedIn: 'root',
})
export class PvMarcheService {
  pvMarche: PvMarche = new PvMarche();
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

  getAllPvMarches(): Observable<PvMarche[]> {
    return this.httpClient.get<PvMarche[]>(
      `${this.baseUrl}/PvMarche/getAllPvMarches`
    );
  }

  getPvMarche(id: number): Observable<PvMarche> {
    return this.httpClient
      .get<PvMarche>(`${this.baseUrl}/PvMarche/getPvMarcheById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addPvMarche(PvMarche: PvMarche): Observable<PvMarche> {
    return this.httpClient
      .post<PvMarche>(this.baseUrl + '/PvMarche/addPvMarche', PvMarche, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updatePvMarche(PvMarche: PvMarche): Observable<PvMarche> {
    return this.httpClient
      .put<PvMarche>(`${this.baseUrl}/PvMarche/updatePvMarche`, PvMarche, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deletePvMarche(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/PvMarche/deletePvMarcheById/${id}`)
      .pipe(catchError(this.handleError));
  }
}
