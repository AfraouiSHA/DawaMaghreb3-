import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Phase } from '../models/phase.model';
import { Page } from '../page.model';

@Injectable({
  providedIn: 'root',
})
export class PhaseService {
  phase: Phase = new Phase();
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

  getPhasesByLot(lotId: number 
    ,search?: any,
    pageNum?: number,
    pageSize?: number,
    sortField?: string,
    sortDir?: string
  ): Observable<Page<Phase>> {
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
    const url = `${this.baseUrl}/Phase/getPhases/${lotId}`;

    return this.httpClient.get<Page<Phase>>(url, { params: params });
  }
  
  getAllPhasesList(id: number): Observable<Phase[]> {
    return this.httpClient.get<Phase[]>(
      `${this.baseUrl}/Phase/getPhasesByLotId/${id}`
    );
  }

  getPhase(id: number): Observable<Phase> {
    return this.httpClient
      .get<Phase>(`${this.baseUrl}/Phase/getPhaseById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addPhase(Phase: Phase): Observable<Phase> {
    return this.httpClient
      .post<Phase>(this.baseUrl + '/Phase/addPhase', Phase, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  updatePhase(Phase: Phase): Observable<Phase> {
    return this.httpClient
      .put<Phase>(`${this.baseUrl}/Phase/updatePhase`, Phase, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(catchError(this.handleError));
  }

  deletePhase(id: number): Observable<void> {
    return this.httpClient
      .delete<void>(`${this.baseUrl}/Phase/deletePhaseById/${id}`)
      .pipe(catchError(this.handleError));
  }
}
