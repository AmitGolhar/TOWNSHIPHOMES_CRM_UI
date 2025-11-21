import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@app/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class WhatsAppLeadHousingService {
  //private baseUrl = 'http://localhost:8080/api/housing-whatsapp';
  private baseUrl = `${environment.apiUrl}/housing-whatsapp`;

  constructor(private http: HttpClient) {}

  saveLeadMessage(message: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/save`,
      { message },
      { responseType: 'text' as 'json' }
    );
  }

  getLeadList(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/list`);
}

}
