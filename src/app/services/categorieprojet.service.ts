import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CategorieProjet } from '../models/categorieprojet.model';

@Injectable({
  providedIn: 'root',
})
export class CategorieProjetService {
  categorieProjet: CategorieProjet = new CategorieProjet();
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

  getAllCategorieProjets(): Observable<CategorieProjet[]> {
    return this.httpClient.get<CategorieProjet[]>(
      `${this.baseUrl}/CategorieProjet/getCategorieProjets`
    );
  }

  getCategorieProjet(id: number): Observable<CategorieProjet> {
    return this.httpClient
      .get<CategorieProjet>(
        `${this.baseUrl}/CategorieProjet/getCategorieProjetById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addCategorieProjet(
    CategorieProjet: CategorieProjet
  ): Observable<CategorieProjet> {
    return this.httpClient
      .post<CategorieProjet>(
        this.baseUrl + '/CategorieProjet/addCategorieProjet',
        CategorieProjet,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateCategorieProjet(
    CategorieProjet: CategorieProjet
  ): Observable<CategorieProjet> {
    return this.httpClient
      .put<CategorieProjet>(
        `${this.baseUrl}/CategorieProjet/updateCategorieProjet`,
        CategorieProjet,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteCategorieProjet(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/CategorieProjet/deleteCategorieProjetById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
