import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ModeReglement } from '../models/modereglement.model';

@Injectable({
  providedIn: 'root',
})
export class ModeReglementService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getModeReglements(): Observable<ModeReglement[]> {
    return this.httpClient.get<ModeReglement[]>(
      `${this.baseUrl}/ModeReglement/getModeReglements`
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

  getModeReglement(id: number): Observable<any> {
        return this.httpClient
      .get<ModeReglement>(`${this.baseUrl}/ModeReglement/getModeReglementById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addModeReglement(ModeReglement: ModeReglement): Observable<ModeReglement> {
    return this.httpClient
      .post<ModeReglement>(this.baseUrl + '/ModeReglement/addModeReglement', ModeReglement, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateModeReglement(ModeReglement: ModeReglement): Observable<ModeReglement> {
    return this.httpClient
      .put<ModeReglement>(`${this.baseUrl}/ModeReglement/updateModeReglement`, ModeReglement, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteModeReglement(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/ModeReglement/deleteModeReglementById/${id}`)
      .pipe(catchError(this.handleError));
  }
}
