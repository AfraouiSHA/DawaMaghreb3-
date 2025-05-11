import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Lot } from '../models/lot.model';
import { Page } from '../page.model';

@Injectable({
  providedIn: 'root',
})
export class LotService {

  lot: Lot = new Lot();
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

  getLotsByAO(id: number 
    ,search?: any,
    pageNum?: number,
    pageSize?: number,
    sortField?: string,
    sortDir?: string
  ): Observable<Page<Lot>> {
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
    const url = `${this.baseUrl}/Lot/getLots/${id}`;

    return this.httpClient.get<Page<Lot>>(url, { params: params });
  }

  getAllLotsList(id: number): Observable<Lot[]> {
    return this.httpClient.get<Lot[]>(
      `${this.baseUrl}/Lot/getLotsByAppelOffreId/${id}`
    );
  }

  getLot(id: number): Observable<Lot> {
    return this.httpClient
      .get<Lot>(`${this.baseUrl}/Lot/getLotById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addLot(Lot: Lot): Observable<Lot> {
    return this.httpClient
      .post<Lot>(this.baseUrl + '/Lot/addLot', Lot, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updateLot(Lot: Lot): Observable<Lot> {
    return this.httpClient
      .put<Lot>(`${this.baseUrl}/Lot/updateLot`, Lot, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deleteLot(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Lot/deleteLotById/${id}`)
      .pipe(catchError(this.handleError));
  }
 
}
