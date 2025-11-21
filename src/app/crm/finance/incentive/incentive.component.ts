import { Component, OnInit, OnDestroy } from '@angular/core';
import { IncentiveService, Incentive } from '../services/incentive.service';
import { EmployeeService } from '@app/services/employee.service';
import { Employee } from '@app/models/employee.model';
import { Subscription } from 'rxjs';
import { UiToastService } from '@app/services/ui-toast.service';
 
declare var bootstrap: any;

@Component({
  selector: 'app-incentive',
  templateUrl: './incentive.component.html',
  styleUrls: ['./incentive.component.css']
})
export class IncentiveComponent implements OnInit, OnDestroy {
  incentives: Incentive[] = [];
  employees: Employee[] = [];

  searchText = '';
  isLoading = false;
  errorMessage = '';

  model = { employee: '', dealId: '', amount: 0, commissionPct: 0 };
  private sub?: Subscription;

  constructor(
    private svc: IncentiveService,
    private empService: EmployeeService,
    private toast: UiToastService     // ✅ GLOBAL TOAST SERVICE
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadIncentives();
  }

  /** 🔹 Load employees for dropdown */
  loadEmployees(): void {
    this.empService.getAllEmployees().subscribe({
      next: (res) => (this.employees = res),
      error: () => this.toast.error('❌ Failed to load employees')
    });
  }

  /** 🔹 Load incentives */
  loadIncentives(): void {
    this.sub = this.svc.listen().subscribe((data) => {
      this.incentives = data.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    });

    this.svc.getAll().subscribe((data) => {
      if (data?.length && !this.incentives.length) this.incentives = data;
    });
  }

  /** 🔹 Add incentive */
  add(): void {
    if (!this.model.employee || !this.model.dealId ||
        !this.model.amount || !this.model.commissionPct) {
      this.toast.warning('⚠️ Please fill all required fields');
      return;
    }

    const payout = Math.round(this.model.amount * (this.model.commissionPct / 100));

    this.svc.add({
      employee: this.model.employee,
      dealId: this.model.dealId,
      amount: this.model.amount,
      commissionPct: this.model.commissionPct,
      computedPayout: payout,
      status: 'Pending'
    }).subscribe({
      next: () => {
        this.toast.success('✅ Incentive added successfully');
        this.model = { employee: '', dealId: '', amount: 0, commissionPct: 0 };
        bootstrap.Modal.getInstance(document.getElementById('incentiveModal'))?.hide();
      },
      error: () => this.toast.error('❌ Failed to add incentive')
    });
  }

  /** 🔹 Delete incentive */
  delete(id?: number): void {
    if (!id) return;
    if (confirm('Delete this incentive?')) {
      this.svc.delete(id).subscribe({
        next: () => this.toast.success('🗑️ Incentive deleted'),
        error: () => this.toast.error('❌ Failed to delete incentive')
      });
    }
  }

  /** 🔹 Open modal */
  openAddModal(id: string): void {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
