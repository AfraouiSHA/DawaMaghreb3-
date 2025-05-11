// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://ton-backend-api.com/api/auth/register'; // Remplace avec l'URL de ton API

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }
}

