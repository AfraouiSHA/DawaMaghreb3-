import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Operateur } from '../models/operateur.model';
import { TypeFicheSuiviTechnique } from '../models/typefichesuivitechnique.model';

@Injectable({
  providedIn: 'root',
})
export class TypeFicheSuiviTechniqueService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getAllFichesSuiviTechniques(): Observable<TypeFicheSuiviTechnique[]> {
    return this.httpClient.get<TypeFicheSuiviTechnique[]>(
      `${this.baseUrl}/TypeFicheSuiviTechnique/getTypeFicheSuiviTechniques`
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

  getFicheSuiviTechnique(id: number): Observable<any> {
    return this.httpClient
      .get<TypeFicheSuiviTechnique>(
        `${this.baseUrl}/TypeFicheSuiviTechnique/getTypeFicheSuiviTechniqueById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addFicheSuiviTechnique(
    ficheSuiviTechnique: TypeFicheSuiviTechnique
  ): Observable<TypeFicheSuiviTechnique> {
    return this.httpClient
      .post<TypeFicheSuiviTechnique>(
        this.baseUrl + '/TypeFicheSuiviTechnique/addTypeFicheSuiviTechnique',
        ficheSuiviTechnique,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateFicheSuiviTechnique(
    ficheSuiviTechnique: TypeFicheSuiviTechnique
  ): Observable<TypeFicheSuiviTechnique> {
    return this.httpClient
      .put<TypeFicheSuiviTechnique>(
        `${this.baseUrl}/TypeFicheSuiviTechnique/updateTypeFicheSuiviTechnique`,
        ficheSuiviTechnique,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteFicheSuiviTechnique(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/TypeFicheSuiviTechnique/deleteTypeFicheSuiviTechniqueById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
