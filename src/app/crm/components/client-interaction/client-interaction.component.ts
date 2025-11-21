import { Component, OnInit } from '@angular/core';
import { ClientTask } from '@app/models/client.model';
import { ClientService } from '@app/services/client.service';
import { EmployeeService } from '@app/services/employee.service';
import { Employee } from '@app/models/employee.model';
import { finalize } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-client-interaction',
  templateUrl: './client-interaction.component.html',
  styleUrls: ['./client-interaction.component.css'],
})
export class ClientInteractionComponent implements OnInit {
  clientTasks: ClientTask[] = [];
  employees: Employee[] = []; // ✅ employee list here
  selectedTask: ClientTask = this.initTask();
  isEditing = false;
  isLoading = false;
  errorMessage = '';
  searchText = '';
employeeMap: any = {};

  taskTypes: string[] = [
    'Site Visit Scheduling',
    'Site Visit Follow-Up',
    'Pickup & Drop Coordination',
    'Office Meeting / Consultation',
    'Document Collection',
    'Agreement Signing',
    'Payment Collection / Receipt',
    'Feedback / Testimonial Collection',
    'Property Handover / Key Delivery',
    'Post-Sale Support / Maintenance Request',
  ];

  statuses: string[] = ['Pending', 'In Progress', 'Completed'];
  loading = true;
  isSaving = false;

  constructor(
    private clientService: ClientService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loading = false; // hide loader
    }, 1200);
    this.loadTasks();
    this.loadEmployees(); // ✅ Load employee list on init
  }

  // 🔹 Load all employees
loadEmployees(): void {
  this.employeeService.getAllEmployees().subscribe({
    next: (list) => {
      this.employees = list || [];

      // 🔥 Create ID → NAME map
      this.employeeMap = {};
      this.employees.forEach(emp => {
        this.employeeMap[String(emp.id)] = emp.name;
      });
    },
    error: () => console.error('Failed to load employees'),
  });
}


  // 🔹 Load all client tasks
  loadTasks(): void {
    this.isLoading = true;
    this.clientService
      .getAll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (tasks) => (this.clientTasks = tasks),
        error: () => (this.errorMessage = 'Failed to load client tasks.'),
      });
  }

  openAddModal(): void {
    this.isEditing = false;
    this.selectedTask = this.initTask();
    new bootstrap.Modal(document.getElementById('clientModal')).show();
  }

  openEditModal(task: ClientTask): void {
    this.isEditing = true;
    this.selectedTask = { ...task };
    new bootstrap.Modal(document.getElementById('clientModal')).show();
  }
  saveTask(): void {
    if (this.isSaving) return; // prevent double click
    this.isSaving = true;

    const modalEl = document.getElementById('clientModal');
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

    const operation = this.isEditing
      ? this.clientService.update(payload)
      : this.clientService.add(payload);

    operation
      .pipe(finalize(() => (this.isSaving = false))) // 👈 RESET BUTTON
      .subscribe({
        next: () => {
          this.showToast(
            this.isEditing
              ? 'Task updated successfully ✅'
              : 'Task added successfully 🎯'
          );
          modal?.hide();
          this.loadTasks();
        },
        error: () => this.showToast('❌ Failed to save task.'),
      });
  }

  deleteTask(id?: number): void {
    if (id && confirm('Are you sure you want to delete this task?')) {
      this.clientService.delete(id).subscribe({
        next: () => {
          this.showToast('🗑️ Task deleted successfully');
          this.loadTasks();
        },
        error: () => this.showToast('❌ Failed to delete task.'),
      });
    }
  }

  initTask(): ClientTask {
    return {
      taskType: '',
      clientName: '',
      contactNumber: '',
      propertyName: '',
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
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
}
