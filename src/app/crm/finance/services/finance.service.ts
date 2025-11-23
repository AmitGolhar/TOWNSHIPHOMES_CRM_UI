import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { environment } from '@app/environment/environment';
import { AttendanceRecord } from '../modal/attendance.model';

export interface Payment {
  id: number;
  clientName: string;
  clientPhone?: string;
  propertyName?: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'Pending' | 'Partial' | 'Paid';
  nextDueDate?: string;
  paymentDate?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private apiUrl = `${environment.apiUrl}/finance`;

  /** 🔹 BehaviorSubjects for real-time UI updates */
  private payments$ = new BehaviorSubject<Payment[]>([]);
  private attendance$ = new BehaviorSubject<AttendanceRecord[]>([]);
  private incentives$ = new BehaviorSubject<any[]>([]);
  private expenses$ = new BehaviorSubject<any[]>([]);
 
  // ✅ Mock Data
  private mockPayments: Payment[] = [
    { id: 1, clientName: 'Rahul Khanna', clientPhone: '9876543210', propertyName: 'Skyline Residency', totalAmount: 1200000, paidAmount: 800000, pendingAmount: 400000, status: 'Partial', nextDueDate: '2025-10-25', notes: 'Next installment pending' },
    { id: 2, clientName: 'Neha Sharma', clientPhone: '9822012345', propertyName: 'Ocean View', totalAmount: 950000, paidAmount: 950000, pendingAmount: 0, status: 'Paid', paymentDate: '2025-09-10', notes: 'Full payment received' },
    { id: 3, clientName: 'Amit Golhar', clientPhone: '9988776655', propertyName: 'Green Meadows', totalAmount: 1500000, paidAmount: 0, pendingAmount: 1500000, status: 'Pending', nextDueDate: '2025-11-05', notes: '' }
  ];

  private mockRevenue = {
    monthly: [
      { month: 'Jul', collected: 1200000, target: 1500000 },
      { month: 'Aug', collected: 900000, target: 1400000 },
      { month: 'Sep', collected: 1600000, target: 1600000 },
      { month: 'Oct', collected: 700000, target: 1800000 }
    ],
    byAgent: [
      { agent: 'Neha Sharma', collected: 900000 },
      { agent: 'Ravi Deshmukh', collected: 700000 },
      { agent: 'Amit Golhar', collected: 400000 }
    ]
  };

  private mockAttendance: AttendanceRecord[] = [
    { id: 1, employee: 'Neha Sharma', date: '2025-10-09', checkIn: '09:12', checkOut: '18:05', visits: 3, tasksClosed: 5, totalHours: '8h 53m', status: 'Checked Out' },
    { id: 2, employee: 'Ravi Deshmukh', date: '2025-10-09', checkIn: '09:05', checkOut: '17:50', visits: 2, tasksClosed: 3, totalHours: '8h 45m', status: 'Checked Out' }
  ];

  private mockIncentives = [
    { id: 1, employee: 'Neha Sharma', dealId: 'BK101', amount: 50000, commissionPct: 2, computedPayout: 1000, status: 'Pending' }
  ];

  private mockExpenses = [
    { id: 1, type: 'Ad Spend', description: 'Facebook Campaign', amount: 15000, date: '2025-10-01' }
  ];

  constructor(private http: HttpClient) {
    // Initialize with mock data
    this.payments$.next(this.mockPayments);
    this.attendance$.next(this.mockAttendance);
    this.incentives$.next(this.mockIncentives);
    this.expenses$.next(this.mockExpenses);
  }

  getEmployeeRevenue() {
  return this.http.get<any[]>(`${this.apiUrl}/payment-records/employee-revenue`);
}


  /** ====================== ✅ Attendance ====================== */
  getAttendance(): Observable<AttendanceRecord[]> {
    return this.attendance$.asObservable();
  }
  /** ✅ Update visits and tasks count for today's attendance */
  updateVisits(employee: string, visits: number, tasks: number): Observable<boolean> {
    const today = new Date().toISOString().slice(0, 10);
    const record = this.mockAttendance.find(a => a.employee === employee && a.date === today);

    if (record) {
      record.visits = visits;
      record.tasksClosed = tasks;
      // Optional: recompute hours if both in/out exist
      if (record.checkIn && record.checkOut) {
        record.totalHours = this.calculateDuration(record.checkIn, record.checkOut);
      }
      this.attendance$.next([...this.mockAttendance]); // 🔹 instantly update subscribers
      return of(true);
    }

    // If no record found, return false but still keep observable type
    return of(false);
  }

  checkIn(employee: string): Observable<AttendanceRecord> {
    const today = new Date().toISOString().slice(0, 10);
    const existing = this.mockAttendance.find(a => a.employee === employee && a.date === today);
    if (existing) return of(existing);

    const now = new Date();
    const record: AttendanceRecord = {
      id: this.mockAttendance.length + 1,
      employee,
      date: today,
      checkIn: now.toTimeString().slice(0, 5),
      visits: 0,
      tasksClosed: 0,
      status: 'Present'
    };
    this.mockAttendance.push(record);
    this.attendance$.next([...this.mockAttendance]);
    return of(record).pipe(delay(300));
  }

  checkOut(employee: string): Observable<AttendanceRecord | null> {
    const today = new Date().toISOString().slice(0, 10);
    const record = this.mockAttendance.find(a => a.employee === employee && a.date === today && !a.checkOut);
    if (!record) return of(null);

    const now = new Date();
    record.checkOut = now.toTimeString().slice(0, 5);
    record.status = 'Checked Out';
    record.totalHours = this.calculateDuration(record.checkIn!, record.checkOut);
    this.attendance$.next([...this.mockAttendance]);
    return of(record);
  }

  private calculateDuration(checkIn: string, checkOut: string): string {
    const [h1, m1] = checkIn.split(':').map(Number);
    const [h2, m2] = checkOut.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  }

  /** ====================== ✅ Payments ====================== */
  getPayments(): Observable<Payment[]> {
    return this.payments$.asObservable();
  }

  getPaymentById(id: number): Observable<Payment | undefined> {
    const payment = this.mockPayments.find(p => p.id === id);
    return of(payment);
  }

  addPayment(p: Payment): Observable<Payment> {
    p.id = this.mockPayments.length ? Math.max(...this.mockPayments.map(x => x.id)) + 1 : 1;
    this.mockPayments.push(p);
    this.payments$.next([...this.mockPayments]);
    return of(p).pipe(delay(300));
  }

  updatePayment(p: Payment): Observable<Payment> {
    const idx = this.mockPayments.findIndex(x => x.id === p.id);
    if (idx !== -1) this.mockPayments[idx] = p;
    this.payments$.next([...this.mockPayments]);
    return of(p);
  }

  deletePayment(id: number): Observable<boolean> {
    this.mockPayments = this.mockPayments.filter(x => x.id !== id);
    this.payments$.next([...this.mockPayments]);
    return of(true);
  }

  /** ====================== ✅ Revenue ====================== */
  getRevenue(): Observable<any> {
    return of(this.mockRevenue);
  }

  /** ====================== ✅ Incentives ====================== */
  getIncentives(): Observable<any[]> {
    return this.incentives$.asObservable();
  }

  addIncentive(row: any): Observable<any> {
    row.id = this.mockIncentives.length + 1;
    this.mockIncentives.push(row);
    this.incentives$.next([...this.mockIncentives]);
    return of(row);
  }

  /** ====================== ✅ Expenses ====================== */
  getExpenses(): Observable<any[]> {
    return this.expenses$.asObservable();
  }

  addExpense(e: any): Observable<any> {
    e.id = this.mockExpenses.length + 1;
    this.mockExpenses.push(e);
    this.expenses$.next([...this.mockExpenses]);
    return of(e);
  }

  /** ====================== ✅ Analytics ====================== */
  getAgingBuckets(): Observable<{ label: string; count: number; total: number }[]> {
    const now = new Date();
    const buckets = [
      { label: '0-7 days', count: 0, total: 0 },
      { label: '8-30 days', count: 0, total: 0 },
      { label: '>30 days', count: 0, total: 0 }
    ];
    this.mockPayments.forEach(p => {
      if (!p.nextDueDate) return;
      const diff = Math.ceil((new Date(p.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 7) { buckets[0].count++; buckets[0].total += p.pendingAmount; }
      else if (diff <= 30) { buckets[1].count++; buckets[1].total += p.pendingAmount; }
      else { buckets[2].count++; buckets[2].total += p.pendingAmount; }
    });
    return of(buckets);
  }

  getAutomatedFollowups(): Observable<any[]> {
    const now = new Date();
    const out: any[] = [];
    this.mockPayments.forEach(p => {
      if (!p.nextDueDate) return;
      const diff = Math.ceil((new Date(p.nextDueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 2 && p.pendingAmount > 0)
        out.push({ paymentId: p.id, clientName: p.clientName, pendingAmount: p.pendingAmount, dueDate: p.nextDueDate });
    });
    return of(out);
  }

  /** ====================== ✅ Helper ====================== */
  private handleError(error: any): Observable<never> {
    console.error('FinanceService Error:', error);
    return throwError(() => new Error('An error occurred in FinanceService'));
  }
}
