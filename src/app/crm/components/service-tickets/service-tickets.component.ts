import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import {
  ServiceTicket,
  ServiceTicketService,
} from '@app/services/service-ticket.service';
import { EmployeeService } from '@app/services/employee.service';
import { Employee } from '@app/models/employee.model';

declare var bootstrap: any;

@Component({
  selector: 'app-service-tickets',
  templateUrl: './service-tickets.component.html',
  styleUrls: ['./service-tickets.component.css'],
})
export class ServiceTicketsComponent implements OnInit {
  tickets: ServiceTicket[] = [];
  employees: Employee[] = [];
  employeeMap: any = {};
  modalInstance: any = null;

  selectedTicket: ServiceTicket = this.initTicket();

  searchText = '';
  isEditing = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  statuses: string[] = ['Pending', 'In Progress', 'Completed'];
  selectedFiles: File[] = [];

  constructor(
    private ticketService: ServiceTicketService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadEmployees();
  }

  /** 🔹 Load employee list for Assigned To dropdown */
  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data || [];

        // 🔥 Build ID → Name map
        this.employeeMap = {};
        this.employees.forEach((emp) => {
          this.employeeMap[String(emp.id)] = emp.name;
        });
      },
      error: (err) => console.error('❌ Failed to load employees:', err),
    });
  }
  onPhotoSelect(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  /** 🔹 Load All Service Tickets */
  loadTickets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.ticketService
      .getAll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => (this.tickets = data || []),
        error: (err) => {
          console.error('❌ Failed to load tickets:', err);
          this.errorMessage =
            'Failed to load service tickets. Please try again later.';
        },
      });
  }

  /** 🔹 Filter list based on search */
  filteredTickets() {
    if (!this.searchText) return this.tickets;
    const text = this.searchText.toLowerCase();

    return this.tickets.filter(
      (t) =>
        t.serviceName?.toLowerCase().includes(text) ||
        t.customerName?.toLowerCase().includes(text) ||
        t.phone?.toLowerCase().includes(text) ||
        t.issueDetails?.toLowerCase().includes(text) ||
        t.assignedTo?.toLowerCase().includes(text) ||
        t.status?.toLowerCase().includes(text)
    );
  }

  openAddModal(): void {
    this.isEditing = false;
    this.selectedTicket = this.initTicket();

    const modalEl = document.getElementById('ticketModal');

    if (!modalEl) return;

    modalEl.removeAttribute('style');

    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(modalEl, { backdrop: true });
    }

    this.modalInstance.show();
  }

  openEditModal(ticket: ServiceTicket): void {
    this.isEditing = true;
    this.selectedTicket = { ...ticket };

    const modalEl = document.getElementById('ticketModal');

    if (!modalEl) return;

    modalEl.removeAttribute('style');

    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(modalEl, { backdrop: true });
    }

    this.modalInstance.show();
  }

  saveTicket(): void {
    if (this.isSaving) return;
    this.isSaving = true;

    // Mandatory validation
    if (
      !this.selectedTicket.serviceName?.trim() ||
      !this.selectedTicket.customerName?.trim()
    ) {
      this.showToast('⚠️ Please fill all required fields.');
      this.isSaving = false;
      return;
    }

    // Fix assignedTo → employeeId
    const assignedEmployee = this.employees.find(
      (e) => String(e.id) === String(this.selectedTicket.assignedTo)
    );

    const payload: any = {
      ...this.selectedTicket,
      assignedTo: assignedEmployee
        ? String(assignedEmployee.id)
        : this.selectedTicket.assignedTo,
    };

    // -------------------------------
    // ⭐ ALWAYS CREATE FORMDATA
    // -------------------------------
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      if (key === 'photos') return; // skip old base64 photos

      const value = payload[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // ⭐ Append new photos only (if selected)
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });
    }

    const modalEl = document.getElementById('ticketModal');
    // const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
    const modal = this.modalInstance;

    // -------------------------------
    // ⭐ API CALL (Create or Update)
    // -------------------------------
    const request$ = this.isEditing
      ? this.ticketService.updateFormData(this.selectedTicket.id!, formData)
      : this.ticketService.add(formData);

    request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.showToast(
          this.isEditing ? '✅ Updated successfully' : '🎯 Created successfully'
        );

        this.modalInstance?.hide();
        this.modalInstance = null; // VERY IMPORTANT
        this.loadTickets();
      },
      error: () => {
        this.showToast('❌ Failed to save ticket.');
      },
    });
  }

  buildFormData(data: any): FormData {
    const fd = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        fd.append(key, data[key]);
      }
    });
    return fd;
  }

  /** 🔹 Delete */
  deleteTicket(id?: number): void {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    this.isLoading = true;

    this.ticketService
      .delete(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.loadTickets(),
        error: (err) => {
          console.error('❌ Delete failed:', err);
          alert('Failed to delete the ticket.');
        },
      });
  }

  /** 🔹 Initialize Empty Ticket */
  initTicket(): ServiceTicket {
    return {
      id: 0,
      serviceName: '',
      customerName: '',
      phone: '',
      email: '',
      preferredDate: '',
      address: '',
      issueDetails: '',
      society: '',
      wing: '',
      flatNo: '',
      assignedTo: '',
      status: 'Pending',
      dueDate: '',
      photos: [],
    };
  }

  /** 🔹 Toast Popup */
  showToast(message: string): void {
    const toastEl = document.getElementById('toastMessage');
    if (toastEl) {
      toastEl.querySelector('.toast-body')!.textContent = message;
      new bootstrap.Toast(toastEl).show();
    }
  }

 
}
