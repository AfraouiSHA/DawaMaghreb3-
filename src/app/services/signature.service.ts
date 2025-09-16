import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private apiUrl = 'http://localhost:3000/api/remove-image-background';

  constructor(private http: HttpClient) {}

  /**
   * Prepare and send an image to backend for background removal
   */
  uploadSignature(file: File): Observable<Blob> {
    return this.validateAndPrepareImage(file).pipe(
      switchMap(processedFile => {
        const formData = new FormData();
        formData.append('image', processedFile, processedFile.name);

        return this.http.post(this.apiUrl, formData, {
          responseType: 'blob'
        }).pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('HTTP Upload Error:', error);
            return throwError(() => new Error(
              error.error?.message || 
              `Server Error (${error.status}): ${error.statusText}`
            ));
          })
        );
      }),
      catchError(error => {
        console.error('Image Preparation Error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Validate and compress the image file
   */
  private validateAndPrepareImage(file: File): Observable<File> {
    return new Observable<File>(subscriber => {
      if (!file) {
        subscriber.error(new Error('No file provided'));
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        subscriber.error(new Error('Unsupported format. Use JPEG, PNG, or WebP'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        subscriber.error(new Error('Image too large (max 5MB)'));
        return;
      }

      this.compressImage(file)
        .then(optimizedFile => {
          subscriber.next(optimizedFile);
          subscriber.complete();
        })
        .catch(() => {
          subscriber.error(new Error('Image preparation failed'));
        });
    });
  }

  /**
   * Compress image using canvas
   */
  private async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const MAX_SIZE = 800;
            let width = img.width;
            let height = img.height;

            // Resize maintaining aspect ratio
            if (width > height) {
              if (width > MAX_SIZE) {
                height = Math.round(height * (MAX_SIZE / width));
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width = Math.round(width * (MAX_SIZE / height));
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(blob => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }
              resolve(new File([blob], file.name, {
                type: 'image/png',
                lastModified: Date.now()
              }));
            }, 'image/png', 0.85);
          };

          img.onerror = () => reject(new Error('Image load error'));
          img.src = event.target?.result as string;
        } catch (e) {
          reject(e);
        }
      };

      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsDataURL(file);
    });
  }
}