import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ModePassationType } from '../models/modepassationtype.model';

@Injectable({
  providedIn: 'root',
})
export class ModePassationTypeService {
  modePassationType: ModePassationType = new ModePassationType();
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

  getAllModePassationTypes(): Observable<ModePassationType[]> {
    return this.httpClient.get<ModePassationType[]>(
      `${this.baseUrl}/ModePassationType/getAllModePassationTypes`
    );
  }

  getModePassationType(id: number): Observable<ModePassationType> {
    return this.httpClient
      .get<ModePassationType>(
        `${this.baseUrl}/ModePassationType/getModePassationTypeById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addModePassationType(
    ModePassationType: ModePassationType
  ): Observable<ModePassationType> {
    return this.httpClient
      .post<ModePassationType>(
        this.baseUrl + '/ModePassationType/addModePassationType',
        ModePassationType,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateModePassationType(
    ModePassationType: ModePassationType
  ): Observable<ModePassationType> {
    return this.httpClient
      .put<ModePassationType>(
        `${this.baseUrl}/ModePassationType/updateModePassationType`,
        ModePassationType,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteModePassationType(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/ModePassationType/deleteModePassationTypeById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
