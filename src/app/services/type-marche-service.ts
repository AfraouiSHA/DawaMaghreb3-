
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


const baseUrl = environment.baseUrl+'/TypeMarche' ;

@Injectable({
  providedIn: 'root'
})
export class TypeMarcheService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
      return this.http.get<any>(`${baseUrl}/getAllTypeMarche`);
  }

    get(id: any): Observable<any>  {
      return this.http.get<any>(`${baseUrl}/findTypeMarche/${id}`);
    }
  
  create(data: any): Observable<any> {
      return this.http.post(`${baseUrl}/addTypeMarche`, data);
  }

  update(id: any, data: any): Observable<any> {
        return this.http.put(`${baseUrl}/updateTypeMarche/${id}`, data);
  }

  delete(id: any): Observable<any> {
    //return this.http.delete(`${baseUrl}/${id}`);
     return this.http.delete(`${baseUrl}/deleteTypeMarche/${id}`);
  }

}
