import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CahierCharges } from '../models/cahiercharges.model';

@Injectable({
  providedIn: 'root',
})
export class CahierChargesService {
  cahierCharges: CahierCharges = new CahierCharges();
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

  getAllCahierCharges(): Observable<CahierCharges[]> {
    return this.httpClient.get<CahierCharges[]>(
      `${this.baseUrl}/CahierCharges/getAllCahierCharges`
    );
  }
  getUnaffectedCahierCharges(): Observable<CahierCharges[]> {
    return this.httpClient.get<CahierCharges[]>(
      `${this.baseUrl}/CahierCharges/getUnaffectedCahierCharges`
    );
  }

  getCahierCharges(id: number): Observable<CahierCharges> {
    return this.httpClient
      .get<CahierCharges>(
        `${this.baseUrl}/CahierCharges/getCahierChargesById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  addCahierCharges(CahierCharges: CahierCharges): Observable<CahierCharges> {
    return this.httpClient
      .post<CahierCharges>(
        this.baseUrl + '/CahierCharges/addCahierCharges',
        CahierCharges,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateCahierCharges(CahierCharges: CahierCharges): Observable<CahierCharges> {
    return this.httpClient
      .put<CahierCharges>(
        `${this.baseUrl}/CahierCharges/updateCahierCharges`,
        CahierCharges,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteCahierCharges(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(
        `${this.baseUrl}/CahierCharges/deleteCahierChargesById/${id}`
      )
      .pipe(catchError(this.handleError));
  }
  setAppelOffreToCahierCharges(aoId: number, ccId: number) {
    return this.httpClient
      .put<CahierCharges>(
        `${this.baseUrl}/CahierCharges/setAppelOffresToCahierCharges/${aoId}/${ccId}`,
        CahierCharges,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        }
      )
      .pipe(catchError(this.handleError));
  }

  isAppelOffreAffected(id: number) {
    return this.httpClient.get<boolean>(
      `${this.baseUrl}/CahierCharges/isAppelOffreAffected/${id}`
    );
  }
  getCCByAppelOffres(id: number): Observable<CahierCharges> {
    return this.httpClient
      .get<CahierCharges>(
        `${this.baseUrl}/CahierCharges/GetCahierChargesByAppelOffresId/${id}`
      )
      .pipe(catchError(this.handleError));
  }
}
