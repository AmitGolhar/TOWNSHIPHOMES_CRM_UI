import { Component, OnInit } from '@angular/core';
import { Employee } from '@app/models/employee.model';
import { LeadTask } from '@app/models/lead.model';
import { EmailService } from '@app/services/email.service';
import { EmployeeService } from '@app/services/employee.service';
import { LeadService } from '@app/services/lead.service';

declare var bootstrap: any;

@Component({
  selector: 'app-lead-management',
  templateUrl: './lead-management.component.html',
  styleUrls: ['./lead-management.component.css'],
})
export class LeadManagementComponent implements OnInit {
  leadTasks: LeadTask[] = [];
  searchText = '';
  selectedTask: LeadTask = this.initTask();
  isEditing = false;

  taskTypes: string[] = [
    'New Lead Follow-Up',
    'Call / WhatsApp Follow-Up',
    'Send Property Details',
    'Schedule Site Visit',
    'Update Lead Status',
    'Lead Assignment',
    'Lead Qualification',
    'Record Feedback / Notes',
    'Negotiation / Offer Discussion',
    'Booking Confirmation',
    'Re-Engage Dormant Lead',
    'Close / Lost Lead Reason',
  ];

  statuses: string[] = ['Pending', 'In Progress', 'Completed'];
  employees: Employee[] = [];
isSaving = false;


  constructor(
    private leadService: LeadService,

    private employeeService: EmployeeService,
    private emailService: EmailService
  ) {}

  ngOnInit(): void {
    this.loadLeads();
    this.loadEmployees();
  }

  // ✅ Fetch All Leads
  loadLeads(): void {
    this.leadService.getAllLeads().subscribe({
      next: (tasks) => {
        this.leadTasks = tasks;
      },
      error: (err) => console.error('Error loading leads:', err),
    });
  }

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (res) => (this.employees = res),
      error: (err) => console.error('Error loading employees:', err),
    });
  }

  // ✅ Open Add Modal
  openAddModal(): void {
    this.isEditing = false;
    this.selectedTask = this.initTask();
    const modal = document.getElementById('leadModal');
    if (modal) new bootstrap.Modal(modal).show();
  }

  // ✅ Open Edit Modal
  openEditModal(task: LeadTask): void {
    this.isEditing = true;
    this.selectedTask = { ...task };
    const modal = document.getElementById('leadModal');
    if (modal) new bootstrap.Modal(modal).show();
  }

  saveTask(): void {

  if (this.isSaving) return; // ⛔ Prevent double click
  this.isSaving = true;

  const modalEl = document.getElementById('leadModal');
  const modal = bootstrap.Modal.getInstance(modalEl!);

  // 🔥 Fix assignedTo → employeeId
  const assignedEmployee = this.employees.find(
    e => String(e.id) === String(this.selectedTask.assignedTo)
  );

  const payload = {
    ...this.selectedTask,
    assignedTo: assignedEmployee ? String(assignedEmployee.id) : this.selectedTask.assignedTo
  };

  const request$ = this.isEditing
    ? this.leadService.updateLead(payload)
    : this.leadService.addLead(payload);

  request$.subscribe({
    next: () => {
      this.showToast(
        this.isEditing
          ? "✅ Lead task updated successfully"
          : "🎯 Lead task added successfully"
      );
      modal?.hide();
      this.loadLeads();
      this.isSaving = false;
    },
    error: () => {
      this.showToast("❌ Failed to save lead task. Try again.");
      this.isSaving = false;
    }
  });
}

showToast(message: string): void {
  const toastEl = document.getElementById('toastMessage');
  if (toastEl) {
    toastEl.querySelector('.toast-body')!.textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

  // ✅ Delete Lead
  deleteTask(id?: number): void {
    if (id && confirm('Are you sure you want to delete this task?')) {
      this.leadService.deleteLead(id).subscribe({
        next: () => this.loadLeads(),
        error: (err) => console.error('Error deleting lead:', err),
      });
    }
  }

  // ✅ Initialize Empty Task
  initTask(): LeadTask {
    return {
      taskType: '',
      leadName: '',
      contactNumber: '',
      propertyName: '',
      assignedTo: '',
      status: 'Pending',
      dueDate: '',
      notes: '',
    };
  }

  private getAssignedEmail(empId: string): string | null {
    const emp = this.employees.find((e) => String(e.id) === String(empId));
    return emp ? emp.email : null;
  }
}
