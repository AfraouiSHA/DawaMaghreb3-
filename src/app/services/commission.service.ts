import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Commission } from '../models/commission.model';
import { environment } from 'src/environments/environment';


// const baseUrl = environment.baseUrl ;
@Injectable({
    providedIn: 'root',
})
export class CommissionService {
    // baseUrl = environment.baseUrl ;
    private baseUrl = 'http://localhost:8584';
    constructor(private httpClient: HttpClient) {
    }

    getCommissions(): Observable<Commission[]> {
        return this.httpClient.get<Commission[]>(`${this.baseUrl}/commissions/all`);
    }

    private handleError(errorResponse: HttpErrorResponse) {
        if (errorResponse.error instanceof ErrorEvent) {
            console.error('Client Side Error :', errorResponse.error.message);
        } else {
            console.error('Server Side Error :', errorResponse);
        }
        return throwError('There is a problem with the service. We are notified & working on it. Please try again later.');
    }

    getCommission(id: number): Observable<Commission> {
        console.log("################# id" + id);
        return this.httpClient.get<Commission>(`${this.baseUrl}/commissions/find/${id}`)
            .pipe(catchError(this.handleError))
    }

    addCommission(commission: Commission): Observable<Commission> {
        return this.httpClient.post<Commission>(this.baseUrl+'/commissions/add', commission, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        })
        .pipe(catchError(this.handleError));
    }

    updateCommission(commission: Commission): Observable<Commission> {
        return this.httpClient.put<Commission>(`${this.baseUrl}/commissions/update`, commission, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        })
            .pipe(catchError(this.handleError));
    }

    deleteCommission(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/commissions/deleteMembre/${id}`)
            .pipe(catchError(this.handleError));
    }
}