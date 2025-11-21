import { Component, OnInit } from '@angular/core';
import { MarketingTask } from '@app/models/marketing.model';
import { MarketingService } from '@app/services/marketing.service';
import { EmployeeService } from '@app/services/employee.service';
import { Employee } from '@app/models/employee.model';
import { finalize } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-marketing-outreach',
  templateUrl: './marketing-outreach.component.html',
  styleUrls: ['./marketing-outreach.component.css'],
})
export class MarketingOutreachComponent implements OnInit {
  marketingTasks: MarketingTask[] = [];
  employees: Employee[] = []; // ✅ employee list dropdown

  selectedTask: MarketingTask = this.initTask();
  searchText = '';
  isEditing = false;
  isLoading = false;
  errorMessage = '';
  isSaving = false;
  employeeMap: any = {};

  taskTypes: string[] = [
    'Campaign Follow-Up',
    'Social Media Post / Boost',
    'Lead Source Analysis',
    'Listing Promotion / Refresh',
    'Creative / Brochure Design',
    'Email / SMS Blast',
    'Ad Budget Optimization',
    'Performance Reporting',
  ];

  platforms: string[] = [
    'Facebook Ads',
    'Instagram Ads',
    'Google Ads',
    'LinkedIn',
    'YouTube',
    'Housing.com',
    '99acres',
    'Offline Event',
  ];

  statuses: string[] = ['Pending', 'In Progress', 'Completed'];

  constructor(
    private marketingService: MarketingService,
    private employeeService: EmployeeService // ✅ inject employee service
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadEmployees(); // ✅ load employee list
  }

  // 🔹 Load employees
  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data || [];

        // 🔥 Create ID → Name map
        this.employeeMap = {};
        this.employees.forEach((emp) => {
          this.employeeMap[String(emp.id)] = emp.name;
        });
      },
      error: () => console.error('Failed to load employees'),
    });
  }

  // 🔹 Load all tasks
  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.marketingService
      .getAll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (tasks) => (this.marketingTasks = tasks),
        error: () => (this.errorMessage = '⚠️ Failed to load marketing tasks.'),
      });
  }

  openAddModal(): void {
    this.isEditing = false;
    this.selectedTask = this.initTask();
    new bootstrap.Modal(document.getElementById('marketingModal')).show();
  }

  openEditModal(task: MarketingTask): void {
    this.isEditing = true;
    this.selectedTask = { ...task };
    new bootstrap.Modal(document.getElementById('marketingModal')).show();
  }
  saveTask(): void {
    if (this.isSaving) return; // ⛔ block double click
    this.isSaving = true;

    const modalEl = document.getElementById('marketingModal');
    const modal = bootstrap.Modal.getInstance(modalEl);

    // 🔥 Ensure assignedTo = employeeId
    const assignedEmployee = this.employees.find(
      (e) => String(e.id) === String(this.selectedTask.assignedTo)
    );

    const payload = {
      ...this.selectedTask,
      assignedTo: assignedEmployee
        ? String(assignedEmployee.id)
        : this.selectedTask.assignedTo,
    };

    const op = this.isEditing
      ? this.marketingService.update(payload)
      : this.marketingService.add(payload);

    op.subscribe({
      next: () => {
        this.showToast(
          this.isEditing
            ? '✅ Task updated successfully'
            : '🎯 Task added successfully'
        );

        modal?.hide();
        this.loadTasks();
        this.isSaving = false;
      },
      error: () => {
        this.showToast('❌ Failed to save task');
        this.isSaving = false;
      },
    });
  }

  deleteTask(id?: number): void {
    if (id && confirm('Delete this task?')) {
      this.marketingService.delete(id).subscribe({
        next: () => {
          this.showToast('🗑️ Task deleted');
          this.loadTasks();
        },
        error: () => this.showToast('❌ Failed to delete task'),
      });
    }
  }

  initTask(): MarketingTask {
    return {
      taskType: '',
      campaignName: '',
      platform: '',
      assignedTo: '',
      status: 'Pending',
      dueDate: '',
      notes: '',
    };
  }

  showToast(message: string): void {
    const toastEl = document.getElementById('toastMessage');
    if (toastEl) {
      toastEl.querySelector('.toast-body')!.textContent = message;
      new bootstrap.Toast(toastEl).show();
    }
  }
}
