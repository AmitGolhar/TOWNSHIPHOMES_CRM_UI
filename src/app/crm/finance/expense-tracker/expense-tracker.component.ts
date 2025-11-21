import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExpenseService, Expense } from '../services/expense.service';
import { Subscription } from 'rxjs';
import { UiToastService } from '@app/services/ui-toast.service';
 
declare var bootstrap: any;

@Component({
  selector: 'app-expense-tracker',
  templateUrl: './expense-tracker.component.html',
  styleUrls: ['./expense-tracker.component.css']
})
export class ExpenseTrackerComponent implements OnInit, OnDestroy {
  expenses: Expense[] = [];
  model: Expense = { type: '', description: '', amount: 0, date: '' };
  private sub?: Subscription;

  constructor(
    private svc: ExpenseService,
    private toast: UiToastService   // ✅ GLOBAL TOAST SERVICE
  ) {}

  ngOnInit(): void {
    // SSE subscription
    this.sub = this.svc.listen().subscribe((data) => {
      this.expenses = data.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    });

    // Initial fallback load
    this.svc.getAll().subscribe((data) => {
      if (!this.expenses.length && data?.length) this.expenses = data;
    });
  }

  /** ➕ Add Expense */
  add(): void {
    if (!this.model.type || !this.model.amount) {
      this.toast.warning('⚠️ Please fill all required fields');
      return;
    }

    this.svc.add({ ...this.model }).subscribe({
      next: () => {
        this.toast.success('✅ Expense added successfully');

        const modal = bootstrap.Modal.getInstance(
          document.getElementById('expenseModal')
        );
        modal?.hide();

        this.model = { type: '', description: '', amount: 0, date: '' };
      },
      error: () => this.toast.error('❌ Failed to add expense')
    });
  }

  /** 🗑️ Delete expense */
  delete(id?: number): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this expense?')) {
      this.svc.delete(id).subscribe({
        next: () => this.toast.success('🗑️ Expense deleted'),
        error: () => this.toast.error('❌ Failed to delete expense')
      });
    }
  }

  /** 🎯 Open Add Modal */
  openAddModal(): void {
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('expenseModal')
    ).show();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
