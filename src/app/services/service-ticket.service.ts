import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@app/environment/environment';

export interface ServiceTicket {
  id: number;
  serviceName: string;
  customerName: string;
  phone: string;
  email?: string;
  preferredDate: string;
  address: string;
  issueDetails: string;

  society?: string;
  wing?: string;
  flatNo?: string;

  assignedTo: string;
  status: string;
  dueDate: string;

  photos?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ServiceTicketService {

  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  /** 🔹 GET ALL */
  getAll(): Observable<ServiceTicket[]> {
    return this.http.get<ServiceTicket[]>(this.apiUrl);
  }

  /** 🔹 GET BY ID */
  getById(id: number): Observable<ServiceTicket> {
    return this.http.get<ServiceTicket>(`${this.apiUrl}/${id}`);
  }

  /** 🔹 DELETE */
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /** 🔹 UPDATE (PUT - JSON body) */
  update(id: number, body: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, body);
  }

  /** 🔹 CREATE (POST - multipart/form-data) */
  add(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, formData);
  }

  updateFormData(id: number, formData: FormData) {
  return this.http.put(`${this.apiUrl}/${id}`, formData);
}

}
