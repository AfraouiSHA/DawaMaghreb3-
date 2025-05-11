import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormeJuridique } from '../models/formejuridique.model';

@Injectable({
  providedIn: 'root',
})
export class FormeJuridiqueService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getFormesJuridiques(): Observable<FormeJuridique[]> {
    return this.httpClient.get<FormeJuridique[]>(
      `${this.baseUrl}/Formejuridique/getFormejuridiques`
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

  getFormeJuridique(id: number): Observable<any> {
    // console.log("Formejuridique Id : " + id);
    return this.httpClient
      .get<FormeJuridique>(`${this.baseUrl}/Formejuridique/getFormejuridiqueById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addFormeJuridique(Formejuridique: FormeJuridique): Observable<FormeJuridique> {
    return this.httpClient
      .post<FormeJuridique>(this.baseUrl + '/Formejuridique/addFormejuridique', Formejuridique, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateFormeJuridique(Formejuridique: FormeJuridique): Observable<FormeJuridique> {
    return this.httpClient
      .put<FormeJuridique>(`${this.baseUrl}/Formejuridique/updateFormejuridique`, Formejuridique, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteFormeJuridique(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Formejuridique/deleteFormejuridiqueById/${id}`)
      .pipe(catchError(this.handleError));
  }
}