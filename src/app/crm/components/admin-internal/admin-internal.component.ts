import { Component, OnInit } from '@angular/core';
import { AdminTask } from '@app/models/admin.model';
import { Employee } from '@app/models/employee.model';
import { AdminService } from '@app/services/admin.service';
import { EmployeeService } from '@app/services/employee.service';
import { finalize } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-internal',
  templateUrl: './admin-internal.component.html',
  styleUrls: ['./admin-internal.component.css'],
})
export class AdminInternalComponent implements OnInit {
  adminTasks: AdminTask[] = [];
  selectedTask: AdminTask = this.initTask();
  searchText = '';
  isEditing = false;
  isLoading = false;
  errorMessage = '';
  employees: Employee[] = [];
employeeMap: any = {};   // 🔥 NEW

  taskTypes: string[] = [
    'Team Meeting / Briefing',
    'Report Submission',
    'CRM Data Update / Cleanup',
    'Training / Onboarding',
    'Office Maintenance / Supplies',
    'System Access Setup',
    'Inventory Management',
    'Compliance / Audit Task',
  ];

  departments: string[] = [
    'Sales',
    'Marketing',
    'Legal',
    'Operations',
    'Admin',
    'Support',
    'IT',
  ];

  priorities: string[] = ['Low', 'Medium', 'High'];
  statuses: string[] = ['Pending', 'In Progress', 'Completed'];
loading = true;
isSaving = false;

  constructor(
    private adminService: AdminService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadEmployees();

      setTimeout(() => {
    this.loading = false; // hide loader
  }, 1200);
  }

  /** 🔹 Load tasks from backend */
  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService
      .getAll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (tasks) => (this.adminTasks = tasks),
        error: () =>
          (this.errorMessage =
            '⚠️ Failed to load admin tasks. Please try again later.'),
      });
  }

loadEmployees() {
  this.employeeService.getAllEmployees().subscribe({
    next: (res) => {
      this.employees = res || [];

      // 🔥 Build employeeMap (same as Marketing)
      this.employeeMap = {};
      this.employees.forEach(emp => {
        this.employeeMap[String(emp.id)] = emp.name;
      });
    },
    error: (err) => console.error('Error loading employees:', err),
  });
}


  /** 🔹 Open Add Modal */
  openAddModal(): void {
    this.isEditing = false;
    this.selectedTask = this.initTask();
    new bootstrap.Modal(document.getElementById('adminModal')).show();
  }

  /** 🔹 Open Edit Modal */
  openEditModal(task: AdminTask): void {
    this.isEditing = true;
    this.selectedTask = { ...task };
    new bootstrap.Modal(document.getElementById('adminModal')).show();
  }

saveTask(): void {
  if (this.isSaving) return; // prevent double click
  this.isSaving = true;

  const modalEl = document.getElementById('adminModal');
  const modal = bootstrap.Modal.getInstance(modalEl);

  // 🔥 Ensure assignedTo = employeeId (not email)
  const assignedEmployee = this.employees.find(
    (e) => String(e.id) === String(this.selectedTask.assignedTo)
  );

  const payload = {
    ...this.selectedTask,
    assignedTo: assignedEmployee
      ? String(assignedEmployee.id)
      : this.selectedTask.assignedTo,
  };

  const operation = this.isEditing
    ? this.adminService.update(payload)
    : this.adminService.add(payload);

  operation
    .pipe(finalize(() => (this.isSaving = false))) // 👈 AUTO RESET
    .subscribe({
      next: () => {
        this.showToast(
          this.isEditing
            ? '✅ Task updated successfully!'
            : '🎯 New task added!'
        );
        modal?.hide();
        this.loadTasks();
      },
      error: () => this.showToast('❌ Failed to save task. Please retry.'),
    });
}


  /** 🔹 Delete */
  deleteTask(id?: number): void {
    if (id && confirm('Are you sure you want to delete this task?')) {
      this.adminService.delete(id).subscribe({
        next: () => {
          this.showToast('🗑️ Task deleted successfully');
          this.loadTasks();
        },
        error: () => this.showToast('❌ Failed to delete task.'),
      });
    }
  }

  /** 🔹 Default Empty Task */
  initTask(): AdminTask {
    return {
      taskType: '',
      department: '',
      assignedTo: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: '',
      notes: '',
    };
  }

  /** 🔹 Show Toast Message */
  showToast(message: string): void {
    const toastEl = document.getElementById('toastMessage');
    if (toastEl) {
      toastEl.querySelector('.toast-body')!.textContent = message;
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
}
