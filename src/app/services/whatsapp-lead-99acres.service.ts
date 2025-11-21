import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@app/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class WhatsAppLead99acresService {
  private baseUrl = `${environment.apiUrl}/99acres-whatsapp`;

  constructor(private http: HttpClient) {}

  saveLeadMessage(message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, { message });
  }

  getLeadList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/list`);
  }
}
