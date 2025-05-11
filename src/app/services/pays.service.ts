import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Pays } from '../models/pays.model';
import { Gouvernerat } from '../models/gouvernerats.model';

@Injectable({
  providedIn: 'root',
})
export class PaysService {
  pays: Pays = new Pays();
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

  getAllPays(): Observable<Pays[]> {
    return this.httpClient.get<Pays[]>(`${this.baseUrl}/Pays/getPays`);
  }

  getPays(id: number): Observable<any> {
    return this.httpClient
      .get<Pays>(`${this.baseUrl}/Pays/getPaysById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addPays(Pays: Pays): Observable<Pays> {
    return this.httpClient
      .post<Pays>(this.baseUrl + '/Pays/addPays', Pays, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updatePays(Pays: Pays): Observable<Pays> {
    return this.httpClient
      .put<Pays>(`${this.baseUrl}/Pays/updatePays`, Pays, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deletePays(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Pays/deletePaysById/${id}`)
      .pipe(catchError(this.handleError));
  }

  /////////////////////////////////////////////

  getPaysGouvernerats(id: number): Observable<Gouvernerat[]> {
    return this.httpClient
      .get<Gouvernerat[]>(
        `${this.baseUrl}/Gouvernerat/getGouvernerats/byPaysId/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addPaysGouvernerat(gouvernerat: Gouvernerat): Observable<Gouvernerat> {
    return this.httpClient
      .post<Gouvernerat>(
        `${this.baseUrl}/Gouvernerat/addGouvernerat/toPays`,
        gouvernerat,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }
}
