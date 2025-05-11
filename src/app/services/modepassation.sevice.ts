import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ModePassation } from '../models/modepassation.model';

@Injectable({
  providedIn: 'root',
})
export class ModePassationService {
  modePassation: ModePassation = new ModePassation();
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

  getAllModePassations(): Observable<ModePassation[]> {
    return this.httpClient.get<ModePassation[]>(
      `${this.baseUrl}/ModePassation/getAllModePassations`
    );
  }

  getModePassation(id: number): Observable<ModePassation> {
    return this.httpClient
      .get<ModePassation>(
        `${this.baseUrl}/ModePassation/getModePassationById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addModePassation(ModePassation: ModePassation): Observable<ModePassation> {
    return this.httpClient
      .post<ModePassation>(
        this.baseUrl + '/ModePassation/addModePassation',
        ModePassation,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateModePassation(ModePassation: ModePassation): Observable<ModePassation> {
    return this.httpClient
      .put<ModePassation>(
        `${this.baseUrl}/ModePassation/updateModePassation`,
        ModePassation,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteModePassation(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/ModePassation/deleteModePassationById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
