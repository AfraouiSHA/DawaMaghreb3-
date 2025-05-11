import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CorrespondanceClarification } from '../models/correspondanceclarification.model';
import { Page } from '../page.model';

// const baseUrl = environment.baseUrl ;
@Injectable({
  providedIn: 'root',
})
export class CorrespondanceClarificationService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getCorrespondanceClarificationsByType(
    id: number,
    type: string,
    search?: any,
    pageNum?: number,
    pageSize?: number,
    sortField?: string,
    sortDir?: string
  ): Observable<Page<CorrespondanceClarification>> {
    let params: HttpParams = new HttpParams();
    params = params.set('type', type);
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
    const url = `${this.baseUrl}/ClarificationCorrespondance/getClarificationCorrespondances/${id}`;

    return this.httpClient.get<Page<CorrespondanceClarification>>(url, {
      params: params,
    });
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

  getCorrespondanceClarification(id: number): Observable<CorrespondanceClarification> {
    console.log('id' + id);
    return this.httpClient
      .get<CorrespondanceClarification>(
        `${this.baseUrl}/ClarificationCorrespondance/getClarificationCorrespondanceById/${id}`
      )
      .pipe(catchError(this.handleError));
  }

 
}
