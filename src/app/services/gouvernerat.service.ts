import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Gouvernerat } from '../models/gouvernerats.model';
import { Ville } from '../models/villes.model';
import { EventEmitter } from '@angular/core';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GouverneratService {
  // baseUrl = environment.baseUrl ;
  gouv: Gouvernerat = new Gouvernerat();
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getGouvernerats(): Observable<Gouvernerat[]> {
    return this.httpClient.get<Gouvernerat[]>(
      `${this.baseUrl}/Gouvernerat/getGouvernerats`
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

  getGouvernerat(id: number): Observable<any> {
    // console.log("Gouvernerat Id : " + id);
    return this.httpClient
      .get<Gouvernerat>(`${this.baseUrl}/Gouvernerat/getGouverneratById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addGouvernerat(gouvernerat: Gouvernerat): Observable<Gouvernerat> {
    return this.httpClient
      .post<Gouvernerat>(
        this.baseUrl + '/Gouvernerat/addGouvernerat',
        gouvernerat,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateGouvernerat(gouvernerat: Gouvernerat): Observable<Gouvernerat> {
    return this.httpClient
      .put<Gouvernerat>(`${this.baseUrl}/Gouvernerat/updateGouvernerat`, gouvernerat, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteGouvernerat(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Gouvernerat/deleteGouverneratById/${id}`)
      .pipe(catchError(this.handleError));
  }
  ///////////////////////////////////////////////
  getGouverneratVilles(id: number): Observable<Ville[]> {
    return this.httpClient
      .get<Ville[]>(`${this.baseUrl}/Ville/getVilles/byGouverneratId/${id}`)
      .pipe(catchError(this.handleError));
  }

  addGouverneratVille(ville: Ville): Observable<Ville> {
    console.log(ville);
    return this.httpClient
      .post<Ville>(
        `${this.baseUrl}/Ville/addVille/toGouvernerat`,
        ville,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }
  /////////////////////////////////////////////
}
