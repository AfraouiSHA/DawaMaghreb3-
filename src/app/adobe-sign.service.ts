import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AdobeSignService {
  private apiUrl = "https://api.adobesign.com/api/rest/v6"; // Replace with actual Adobe Sign API URL
  private accessToken = "YOUR_ADOBE_SIGN_ACCESS_TOKEN"; // Replace with your Adobe Sign access token

  constructor(private http: HttpClient) {}

  // Example method to send a document for signature
  sendDocumentForSignature(file: File, recipientEmail: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "multipart/form-data",
    });

    const formData: FormData = new FormData();
    formData.append("File", file, file.name);
    formData.append("recipients", JSON.stringify([{ email: recipientEmail }]));
    formData.append("name", "Document for Signature");
    formData.append("status", "AUTHORING");

    return this.http
      .post(`${this.apiUrl}/transientDocuments`, formData, { headers })
      .pipe(
        catchError((error) => {
          console.error("Error sending document for signature:", error);
          return of(null);
        }),
      );
  }

  // Example method to check the status of an agreement
  getAgreementStatus(agreementId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
    });

    return this.http
      .get(`${this.apiUrl}/agreements/${agreementId}`, { headers })
      .pipe(
        catchError((error) => {
          console.error("Error getting agreement status:", error);
          return of(null);
        }),
      );
  }

  // Handle errors
  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
