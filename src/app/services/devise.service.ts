import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Devise } from '../models/devise.model';
import { Page } from '../page.model';

@Injectable({
  providedIn: 'root',
})
export class DeviseService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getDevises(
    search?: any,
    pageNum?: number,
    pageSize?: number,
    sortField?: string,
    sortDir?: string
  ): Observable<Page<Devise>> {
    let params: HttpParams = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }

    if (pageNum) {
      params = params.set('pageNum', pageNum);
    }

    if (pageSize) {
      params = params.set('pageSize', pageSize);
    }

    if (sortField && sortDir) {
      params = params.set('sortField', sortField).set('sortDir', sortDir);
    }
    const url = `${this.baseUrl}/Devise/getDevises`;

    return this.httpClient.get<Page<Devise>>(url, { params: params });
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

  getDevise(id: number): Observable<any> {
    // console.log("Devise Id : " + id);
    return this.httpClient
      .get<Devise>(`${this.baseUrl}/Devise/getDeviseById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addDevise(Devise: Devise): Observable<Devise> {
    return this.httpClient
      .post<Devise>(this.baseUrl + '/Devise/addDevise', Devise, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateDevise(Devise: Devise): Observable<Devise> {
    return this.httpClient
      .put<Devise>(`${this.baseUrl}/Devise/updateDevise`, Devise, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteDevise(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Devise/deleteDeviseById/${id}`)
      .pipe(catchError(this.handleError));
  }
}
