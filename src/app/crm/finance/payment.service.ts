import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 import { environment } from '@app/environment/environment';
import { Payment } from './modal/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // 🔹 Base API endpoint for payments
  private baseUrl = `${environment.apiUrl}/payment-records`;

  constructor(private http: HttpClient) {}

  /**
   * 🔹 Get all payment records
   */
  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.baseUrl);
  }

  /**
   * 🔹 Get a single payment by ID
   */
  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/${id}`);
  }

  /**
   * 🔹 Add new payment record
   */
  add(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.baseUrl, payment);
  }

  /**
   * 🔹 Update existing payment record
   */
  update(payment: Payment): Observable<Payment> {
    if (!payment.id) {
      throw new Error('Payment ID is required for update.');
    }
    return this.http.put<Payment>(`${this.baseUrl}/${payment.id}`, payment);
  }

  /**
   * 🔹 Delete a payment record by ID
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getEmployeeRevenue() {
  return this.http.get<any[]>(`${this.baseUrl}/employee-revenue`);
}

}
