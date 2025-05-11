import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = '/api/utilisateurs';

  constructor(private http: HttpClient) {}

  getUtilisateurs(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
