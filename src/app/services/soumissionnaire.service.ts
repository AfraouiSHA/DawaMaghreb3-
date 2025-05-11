import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Soumissionnaire } from '../models/Soumissionnaire';
import { Observable, map } from 'rxjs';
import { Page } from '../page.model';

@Injectable({
  providedIn: 'root',
})
export class SoumissionnaireService {
  constructor(private http: HttpClient) {}
  private baseUrl = environment.baseUrl + '/Soumissionnaire';

  /*   public getAll(){
    return this.http.get(this.baseUrl+'/allSoumissionnaires');
  } */
  /*   public getAll(){
    return this.http.get(this.baseUrl+'/getAllSoumissionnaires');
  } */

  public getAll(
    pageNum: any,
    pageSize: any,
    sortDir: any,
    sortField: any,
    search: any
  ) {
    //return this.http.get(this.baseUrl+'/getAllSoumissionnaires');
    return this.http.get<any>(
      `${this.baseUrl}/getAllSoumissionnaires/${pageNum}/${pageSize}?sortDir=${sortDir}&sortField=${sortField}&search=${search}`
    );
  }

  public getByAppelOffreReference(
    appelOffreReference: any,
    pageNum: any,
    pageSize: any,
    sortDir: any,
    sortField: any,
    search: any
  ) {
    return this.http.get(
      `${this.baseUrl}/soumissionnaireByAppelOffre/${appelOffreReference}/${pageNum}/${pageSize}?sortDir=${sortDir}&sortField=${sortField}&search=${search}`
    );
  }

  public exportSoumissionnaireTelechargeChaierCharge(
    appelOffreReference: any
  ): Observable<any> {
    return this.http.get(`${this.baseUrl}/export/${appelOffreReference}`, {
      responseType: 'arraybuffer' as 'json',
    });
  }

  public listeforme() {
    return this.http.get(
      environment.baseUrl + '/formeJuridique/allFormeJuridique'
    );
  }

  public listefonction() {
    return this.http.get(environment.baseUrl + '/fonction');
  }

  public listegouvernerat(id: any) {
    return this.http.get(environment.baseUrl + '/gouv/' + id);
  }

  public listepays() {
    return this.http.get(environment.baseUrl + '/pays');
  }

  public listemarche() {
    return this.http.get(environment.baseUrl + '/typemarche');
  }

  public listeville(id: any) {
    return this.http.get(environment.baseUrl + '/ville/' + id);
  }

  public listeEtat() {
    return this.http.get(environment.baseUrl + '/etat');
  }

  public listetitre() {
    return this.http.get(this.baseUrl + '/getAllTitreRepresentant');
  }

  public ajouter(Soumissionnaire: Soumissionnaire) {
    return this.http.post(this.baseUrl + '/ajouter/', Soumissionnaire);
  }

  public getone(id: any) {
    return this.http.get(this.baseUrl + '/getone/' + id);
  }

  //** */

  public delete(id: any) {
    return this.http.delete(this.baseUrl + '/supp/' + id);
  }

  update(Soumissionnaire: Soumissionnaire) {
    return this.http.put(this.baseUrl + '/update', Soumissionnaire);
  }

  activer(soumissionnaireReference: any) {
    return this.http.get(this.baseUrl + '/activer/' + soumissionnaireReference);
  }
  desactiver(soumissionnaireReference: any) {
    return this.http.get(
      this.baseUrl + '/desactiver/' + soumissionnaireReference
    );
  }

  isUsedBySoumissionnaireId(soumissionnaireReference: any) {
    return this.http.get(
      this.baseUrl + '/isUsedBySoumissionnaireId/' + soumissionnaireReference
    );
  }

  findSoumissionnaireByMatricule(soumissionnaire: any) {
    return this.http.get(
      this.baseUrl + '/findSoumissionnaireByMatricule/' + soumissionnaire
    );
  }
  fetchPdfFile(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/getPdfList`, { responseType: 'blob' })
      .pipe(
        map((response: Blob) => response as Blob)
      );
  }
}
