import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SoumissionnaireBlackList } from '../models/soumissionnaireblacklist.model';

@Injectable({
  providedIn: 'root',
})
export class SoumissionnaireBlackListervice {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getAllSoumissionnaireBlackLists(): Observable<SoumissionnaireBlackList[]> {
    return this.httpClient.get<SoumissionnaireBlackList[]>(
      `${this.baseUrl}/SoumissionnaireBlackList/getSoumissionnaireBlackLists`
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

  getSoumissionnaireBlackList(id: number): Observable<any> {
    return this.httpClient
      .get<SoumissionnaireBlackList>(
        `${this.baseUrl}/SoumissionnaireBlackList/getSoumissionnaireBlackListId/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addSoumissionnaireBlackList(
    soumissionnaireBlackList: SoumissionnaireBlackList
  ): Observable<SoumissionnaireBlackList> {
    return this.httpClient
      .post<SoumissionnaireBlackList>(
        this.baseUrl + '/SoumissionnaireBlackList/addSoumissionnaireBlackList',
        soumissionnaireBlackList,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateSoumissionnaireBlackList(
    soumissionnaireBlackList: SoumissionnaireBlackList
  ): Observable<SoumissionnaireBlackList> {
    return this.httpClient
      .put<SoumissionnaireBlackList>(
        `${this.baseUrl}/SoumissionnaireBlackList/updateSoumissionnaireBlackList`,
        soumissionnaireBlackList,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteSoumissionnaireBlackList(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/SoumissionnaireBlackList/deleteSoumissionnaireBlackListById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

}
