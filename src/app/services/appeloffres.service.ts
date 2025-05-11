import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppelOffres } from '../models/appeloffres.model';
import { Page } from '../page.model';

@Injectable({
  providedIn: 'root',
})
export class AppelOffresService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getAllAppelOffres(  
    search?: any,
    pageNum?: number,
    pageSize?: number,
    sortField?: string,
    sortDir?: string
  ): Observable<Page<AppelOffres>> {
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
    const url = `${this.baseUrl}/AppelOffres/getAppelOffres`;

    return this.httpClient.get<Page<AppelOffres>>(url, { params: params });
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

  getAppelOffres(id: number): Observable<any> {
    // console.log("AppelOffres Id : " + id);
    return this.httpClient
      .get<AppelOffres>(`${this.baseUrl}/AppelOffres/getAppelOffresById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addAppelOffres(
    AppelOffres: AppelOffres,
    
  ): Observable<AppelOffres> {
    return this.httpClient
      .post<AppelOffres>(
        `${this.baseUrl}/AppelOffres/addAppelOffres`,
        AppelOffres,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateAppelOffres(AppelOffres: AppelOffres): Observable<AppelOffres> {
    return this.httpClient
      .put<AppelOffres>(
        `${this.baseUrl}/AppelOffres/updateAppelOffres`,
        AppelOffres,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteAppelOffres(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/AppelOffres/deleteAppelOffresById/${id}`)
      .pipe(catchError(this.handleError));
  }

  setAppelOffresEtat(appelOffresId?: number, etatId?: number): Observable<any> {
    return this.httpClient
      .put<AppelOffres>(
        `${this.baseUrl}/AppelOffres/setEtat/${appelOffresId}/${etatId}`,

        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  setAppelOffresCommission(commId?: number, aoId?: number) {
    return this.httpClient
      .post<AppelOffres>(
        `${this.baseUrl}/AppelOffres/addCommissionToAppelOffres/${commId}/${aoId}`,
        AppelOffres,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }
}
