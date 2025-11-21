import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Employee } from '@app/models/employee.model';
import { EmployeeService } from '@app/services/employee.service';
import { WhatsAppLead99acresService } from '@app/services/whatsapp-lead-99acres.service';

@Component({
  selector: 'app-acres99-whatsapp',
  templateUrl: './acres99-whatsapp.component.html',
  styleUrls: ['./acres99-whatsapp.component.css'],
})
export class Acres99WhatsAppComponent implements OnInit {
  rawMessage: string = '';
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  leads: any[] = [];
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

  employees: Employee[] = [];

  selectedTask = {
    assignedTo: '',
    taskType: 'New Lead Follow-Up',
  };
isSaving = false;
saveMessage = '';

  constructor(
    private lead99Service: WhatsAppLead99acresService,
    private employeeService: EmployeeService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployees();

    this.loadLeads();
  }

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (res) => {
        this.employees = res;

        // 👇 Re-run keyword detection AFTER list is loaded
        if (this.rawMessage.trim().length > 0) {
          this.onRawMessageChange();
        }
      },
      error: (err) => console.error('Error loading employees', err),
    });
  }
submitMessage() {
  if (this.isSaving) return;

  this.isSaving = true;
  this.successMessage = '';
  this.errorMessage = '';
  this.saveMessage = 'Processing...';

  const assignedName = this.getEmployeeNameById(this.selectedTask.assignedTo);

  // Step 1: After 1 sec → Processing...
  setTimeout(() => {
    this.saveMessage = 'Processing...';
  }, 0);

  // Step 2: After 2 sec → Assigning message
  setTimeout(() => {
    this.saveMessage = 'Assigning lead to correct person...';
  }, 1000);

  // Step 3: After 3 sec → Which person is being assigned
  setTimeout(() => {
    this.saveMessage = `Lead is getting assigned to ${assignedName}...`;
  }, 2000);

  // Step 4: After 4 sec → Final assignment text
  setTimeout(() => {
    this.saveMessage = `Ohh! Lead is assigned to ${assignedName} 🎉`;
  }, 3000);

  setTimeout(() => {
    this.saveMessage = `Saving Lead in Lead Management for ${assignedName} 🎉 And Sending Email Notification`;
  }, 4000);
  // Actual API call starts parallel, but UI animation continues
  const payload = {
    message: this.rawMessage,
    assignedTo: this.selectedTask.assignedTo || null,
    taskType: this.selectedTask.taskType || null
  };

  this.lead99Service.saveLeadMessage(payload).subscribe({
    next: () => {
      setTimeout(() => {
        this.successMessage = "✅ Lead saved successfully!";
        this.isSaving = false;
        this.saveMessage = '';
        this.rawMessage = '';
        this.selectedTask.assignedTo = '';
        this.selectedTask.taskType = 'New Lead Follow-Up';
        this.loadLeads();
      }, 3500); // allow animation to finish
    },
    error: () => {
      this.errorMessage = '❌ Failed to save lead.';
      this.isSaving = false;
      this.saveMessage = '';
    }
  });
}


  onRawMessageChange() {
    const text = this.rawMessage.toLowerCase();

    let selectedEmployeeName = '';

    const saleKeywords = [
      'sale',
      'sell',
      'selling',
      'sells',
      'resale',
      're-sale',
      'resell',
      're-sell',
    ];

    const rentKeywords = ['rent', 'rental', 'pg', 'paying guest'];

    if (saleKeywords.some((k) => text.includes(k))) {
      selectedEmployeeName = 'Atul';
    } else if (rentKeywords.some((k) => text.includes(k))) {
      selectedEmployeeName = 'Vijay';
    } else {
      selectedEmployeeName = 'Vijay';
    }

    // Employees loaded?
    if (!this.employees || this.employees.length === 0) {
      return;
    }

    // ⭐ FIX: MATCH USING CONTAINS + IGNORE CASE
    const emp = this.employees.find((e) =>
      e.name.toLowerCase().includes(selectedEmployeeName.toLowerCase())
    );

    if (emp) {
      this.selectedTask.assignedTo = String(emp.id);
      this.cd.detectChanges(); // refresh UI
    }
  }

  loadLeads() {
    this.isLoading = true;
    this.lead99Service.getLeadList().subscribe({
      next: (res) => {
        this.leads = res;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = '❌ Failed to load leads.';
        this.isLoading = false;
      },
    });
  }

  getEmployeeNameById(id: string | null) {
  if (!id) return 'Unknown';
  const emp = this.employees.find(e => String(e.id) === id);
  return emp ? emp.name : 'Unknown';
}
}
