import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CategoriesProjet } from '../models/categoriesprojet.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriesProjetService {
  categoriesProjet: CategoriesProjet = new CategoriesProjet();
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

  getAllCategoriesProjets(): Observable<CategoriesProjet[]> {
    return this.httpClient.get<CategoriesProjet[]>(
      `${this.baseUrl}/CategoriesProjet/getCategoriesProjets`
    );
  }

  getCategoriesProjet(id: number): Observable<CategoriesProjet> {
    return this.httpClient
      .get<CategoriesProjet>(
        `${this.baseUrl}/CategoriesProjet/getCategoriesProjetById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addCategoriesProjet(
    CategoriesProjet: CategoriesProjet
  ): Observable<CategoriesProjet> {
    return this.httpClient
      .post<CategoriesProjet>(
        this.baseUrl + '/CategoriesProjet/addCategoriesProjet',
        CategoriesProjet,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateCategoriesProjet(
    CategoriesProjet: CategoriesProjet
  ): Observable<CategoriesProjet> {
    return this.httpClient
      .put<CategoriesProjet>(
        `${this.baseUrl}/CategoriesProjet/updateCategoriesProjet`,
        CategoriesProjet,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteCategoriesProjet(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/CategoriesProjet/deleteCategoriesProjetById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
