import { Component } from '@angular/core';
import { Employee } from '@app/models/employee.model';
import { EmployeeService } from '@app/services/employee.service';
import { ROLE_GROUPS } from '@app/constants/role-groups.constant';

@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.css']
})
export class EmployeeAddComponent {

  selectedRoles: string[] = [];
  sendSimpleEmail: boolean = true;   // ⭐⭐ RESTORED EMAIL SEND FLAG

  roleGroups = ROLE_GROUPS;
 
  employee: Employee = {
    name: '',
    email: '',
    phone: '',
    department: '',
    joiningDate: '',
    companyEmail: '',
    roles: ''
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private empService: EmployeeService) {}

  toggleRole(role: string, event: any) {
    if (event.target.checked) {
      this.selectedRoles.push(role);
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r !== role);
    }
  }

  submitForm() {
    if (this.isSubmitting) return;

    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    // ⭐ Add Roles as CSV
    this.employee.roles = this.selectedRoles.join(',');

    // ⭐ Include email-send flag in request body
    const payload = {
      ...this.employee,
      sendSimpleEmail: this.sendSimpleEmail   // RESTORED
    };

    this.empService.addEmployee(payload).subscribe({
      next: () => {
        this.successMessage = "🎉 Employee added successfully.";

        this.employee = {
          name: '',
          email: '',
          phone: '',
          department: '',
          joiningDate: '',
          companyEmail: '',
          roles: ''
        };

        this.selectedRoles = [];
        this.sendSimpleEmail = true;

        this.isSubmitting = false;
      },

      error: (err) => {
        this.errorMessage = err.error?.error ?? "❌ Failed to add employee.";
        this.isSubmitting = false;
      }
    });
  }
}
