import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BlackListeMotif } from '../models/blacklistemotif.model';

@Injectable({
  providedIn: 'root',
})
export class BlackListeMotifService {
  // baseUrl = environment.baseUrl ;
  private baseUrl = 'http://localhost:8584';
  constructor(private httpClient: HttpClient) {}

  getAllBlackListeMotifs(): Observable<BlackListeMotif[]> {
    return this.httpClient.get<BlackListeMotif[]>(
      `${this.baseUrl}/BlackListeMotif/getBlackListeMotifs`
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

 
}
