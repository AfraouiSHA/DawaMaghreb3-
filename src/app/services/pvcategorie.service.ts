import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PvCategorie } from '../models/pvcategorie.model';

@Injectable({
  providedIn: 'root',
})
export class PvCategorieService {
  pvCategorie: PvCategorie = new PvCategorie();
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

  getAllPvCategories(): Observable<PvCategorie[]> {
    return this.httpClient.get<PvCategorie[]>(
      `${this.baseUrl}/PvCategorie/getAllPvCategories`
    );
  }

  getPvCategorie(id: number): Observable<PvCategorie> {
    return this.httpClient
      .get<PvCategorie>(`${this.baseUrl}/PvCategorie/getPvCategorieById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addPvCategorie(PvCategorie: PvCategorie): Observable<PvCategorie> {
    return this.httpClient
      .post<PvCategorie>(
        this.baseUrl + '/PvCategorie/addPvCategorie',
        PvCategorie,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updatePvCategorie(PvCategorie: PvCategorie): Observable<PvCategorie> {
    return this.httpClient
      .put<PvCategorie>(
        `${this.baseUrl}/PvCategorie/updatePvCategorie`,
        PvCategorie,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deletePvCategorie(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/PvCategorie/deletePvCategorieById/${id}`)
      .pipe(catchError(this.handleError));
  }
}
