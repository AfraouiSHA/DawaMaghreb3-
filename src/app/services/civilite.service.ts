import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CivileModel } from '../models/civile.model';
import { environment } from 'src/environments/environment';


// const baseUrl = environment.baseUrl ;
@Injectable({
    providedIn: 'root',
})
export class CiviliteService {
    // baseUrl = environment.baseUrl ;
    private baseUrl = 'http://localhost:8584';
    constructor(private httpClient: HttpClient) {
    }

    getCivils(): Observable<CivileModel[]> {
        return this.httpClient.get<CivileModel[]>(`${this.baseUrl}/Civilite/getCivilites`);
    }

    private handleError(errorResponse: HttpErrorResponse) {
        if (errorResponse.error instanceof ErrorEvent) {
            console.error('Client Side Error :', errorResponse.error.message);
        } else {
            console.error('Server Side Error :', errorResponse);
        }
        return throwError('There is a problem with the service. We are notified & working on it. Please try again later.');
    }

    getCivil(id: number): Observable<CivileModel> {
        console.log("################# id" + id);
        return this.httpClient.get<CivileModel>(`${this.baseUrl}/Civilite/getCiviliteById/${id}`)
            .pipe(catchError(this.handleError))
    }

    addCivil(civil: CivileModel): Observable<CivileModel> {
        return this.httpClient.post<CivileModel>(this.baseUrl+'/Civilite/addCivilite', civil, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        })
        .pipe(catchError(this.handleError));
    }

    updateCivil(civil: CivileModel): Observable<CivileModel> {
        return this.httpClient.put<CivileModel>(`${this.baseUrl}/Civilite/updateCivilite`, civil, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        })
            .pipe(catchError(this.handleError));
    }

    deleteCivil(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/Civilite/deleteCiviliteById/${id}`)
            .pipe(catchError(this.handleError));
    }
}