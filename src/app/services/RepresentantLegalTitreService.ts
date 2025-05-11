import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RepresentantLegalTitre } from '../models/RepresentantLegalTitre';
@Injectable({
  providedIn: 'root'
})
export class RepresentantLegalTitreService {

  constructor(private http:HttpClient) { }
  private baseUrl = environment.baseUrl+'/TitreRepresentant' ;

  public liste(): Observable<any> {
    return this.http.get(this.baseUrl+'/getAllTitreRepresentant');
  
  }

  public ajouter(representantLegalTitre:RepresentantLegalTitre){
    return this.http.post(this.baseUrl+"/addRepresentantLegalTitre",representantLegalTitre);
  
  }

  public delete(id:any){
    return this.http.delete(this.baseUrl+"/deleteRepresentantLegalTitre/"+id);
  }



  update(id:any,representantLegalTitre:RepresentantLegalTitre){
    return this.http.put(this.baseUrl+'/update'+'/'+id,representantLegalTitre);
  }

  public details(id:any){
    return this.http.get<any>(this.baseUrl+"/findRepresentantLegalTitre/"+id);
  
  }
}
