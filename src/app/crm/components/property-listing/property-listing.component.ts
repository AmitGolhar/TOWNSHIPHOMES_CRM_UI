import { Component, OnInit } from '@angular/core';
import { PropertyTask } from '@app/models/property.model copy';
import { PropertyService } from '@app/services/property.service';
import { EmployeeService } from '@app/services/employee.service';
import { Employee } from '@app/models/employee.model';
import { finalize } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-property-listing',
  templateUrl: './property-listing.component.html',
  styleUrls: ['./property-listing.component.css'],
})
export class PropertyListingComponent implements OnInit {
  propertyTasks: PropertyTask[] = [];
  employees: Employee[] = []; // 👈 EMPLOYEE LIST
  selectedTask: PropertyTask = this.initTask();
  searchText = '';
  isEditing = false;
  isLoading = false;
  errorMessage = '';
employeeMap: any = {};

  taskTypes: string[] = [
    'Property Onboarding',
    'Property Photo Upload',
    'Property Verification',
    'Maintenance / Repairs',
    'Under Construction Updates',
    'Price / Rent Update',
    'Inventory Check',
  ];
isSaving = false; // ⬅️ Add this at top near isLoading

  statuses: string[] = ['Pending', 'In Progress', 'Completed'];

  constructor(
    private propertyService: PropertyService,
    private employeeService: EmployeeService,
    
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadEmployees(); // 👈 LOAD EMPLOYEES
  }

loadEmployees(): void {
  this.employeeService.getAllEmployees().subscribe({
    next: (data) => {
      this.employees = data || [];

      // 🔥 Build ID → Name map
      this.employeeMap = {};
      this.employees.forEach(emp => {
        this.employeeMap[String(emp.id)] = emp.name;
      });
    },
    error: (err) => console.error('❌ Failed to load employees:', err),
  });
}


  /** 🔹 Load All Property Tasks */
  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.propertyService
      .getAll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (tasks) => (this.propertyTasks = tasks || []),
        error: (err) => {
          console.error('❌ Failed to load property tasks:', err);
          this.errorMessage =
            'Failed to load property data. Please try again later.';
        },
      });
  }

  /** 🔹 Open Add Modal */
  openAddModal(): void {
    this.isEditing = false;
    this.selectedTask = this.initTask();
    const modalEl = document.getElementById('propertyModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  /** 🔹 Open Edit Modal */
  openEditModal(task: PropertyTask): void {
    this.isEditing = true;
    this.selectedTask = { ...task };
    const modalEl = document.getElementById('propertyModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }
saveTask(): void {

  if (this.isSaving) return; // ⛔ block double-submit
  this.isSaving = true;

  // Mandatory field check
  if (!this.selectedTask.propertyName?.trim() || !this.selectedTask.taskType) {
    this.showToast("⚠️ Please fill all mandatory fields.");
    this.isSaving = false;
    return;
  }

  // Ensure assignedTo = employeeId
  const assignedEmployee = this.employees.find(
    (e) => String(e.id) === String(this.selectedTask.assignedTo)
  );

  const payload = {
    ...this.selectedTask,
    assignedTo: assignedEmployee
      ? String(assignedEmployee.id)
      : this.selectedTask.assignedTo,
  };

  const modalEl = document.getElementById('propertyModal');
  const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;

  const request$ = this.isEditing
    ? this.propertyService.update(payload)
    : this.propertyService.add(payload);

  request$.pipe(finalize(() => this.isSaving = false)).subscribe({
    next: () => {
      this.showToast(
        this.isEditing ? "✅ Task updated successfully" : "🎯 Task added successfully"
      );
      modal?.hide();
      this.loadTasks();
    },
    error: () => {
      this.showToast("❌ Failed to save task. Try again.");
    }
  });
}


showToast(message: string): void {
  const toastEl = document.getElementById('toastMessage');
  if (toastEl) {
    toastEl.querySelector('.toast-body')!.textContent = message;
    new bootstrap.Toast(toastEl).show();
  }
}


  /** 🔹 Delete a Task */
  deleteTask(id?: number): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.isLoading = true;
    this.propertyService
      .delete(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.loadTasks(),
        error: (err) => {
          console.error('❌ Delete failed:', err);
          alert('Failed to delete the task.');
        },
      });
  }

  /** 🔹 Initialize New Task */
  initTask(): PropertyTask {
    return {
      taskType: '',
      propertyName: '',
      propertyCode: '',
      location: '',
      assignedTo: '',
      status: 'Pending',
      dueDate: '',
      notes: '',
    };
  }

  /** 🔹 Close Modal */
  private closeModal(): void {
    const modalEl = document.getElementById('propertyModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
}
