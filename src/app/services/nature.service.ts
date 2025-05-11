import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { Nature } from '../models/nature.model';
import { Nature } from '../models/natures.model';

// import { environment } from 'src/environments/environment';
// const baseUrl = environment.baseUrl ;

@Injectable({
  providedIn: 'root',
})
export class NatureService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getNatures(): Observable<Nature[]> {
    return this.httpClient.get<Nature[]>(
      `${this.baseUrl}/Nature/getNatures`
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

  getNature(id: number): Observable<any> {
    // console.log("Nature Id : " + id);
    return this.httpClient
      .get<Nature>(`${this.baseUrl}/Nature/getNatureById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addNature(nature: Nature): Observable<Nature> {
    return this.httpClient
      .post<Nature>(this.baseUrl + '/Nature/addNature', nature, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateNature(nature: Nature): Observable<Nature> {
    return this.httpClient
      .put<Nature>(`${this.baseUrl}/Nature/updateNature`, nature, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteNature(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Nature/deleteNatureById/${id}`)
      .pipe(catchError(this.handleError));
  }
}
