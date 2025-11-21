import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrmLayoutComponent } from './crm-layout/crm-layout.component';
import { LeadManagementComponent } from './components/lead-management/lead-management.component';
import { PropertyListingComponent } from './components/property-listing/property-listing.component';
import { ClientInteractionComponent } from './components/client-interaction/client-interaction.component';
import { MarketingOutreachComponent } from './components/marketing-outreach/marketing-outreach.component';
import { LegalDocumentationComponent } from './components/legal-documentation/legal-documentation.component';
import { ClientSupportComponent } from './components/client-support/client-support.component';
import { AdminInternalComponent } from './components/admin-internal/admin-internal.component';
import { CustomSmartComponent } from './components/custom-smart/custom-smart.component';
import { CrmDashboardComponent } from './components/dashboard/crm-dashboard.component';
import { PaymentListComponent } from './finance/payment-list/payment-list.component';
import { PaymentFormComponent } from './finance/payment-form/payment-form.component';
import { AgingReportComponent } from './finance/aging-report/aging-report.component';
import { RevenueDashboardComponent } from './finance/revenue-dashboard/revenue-dashboard.component';
import { AttendanceComponent } from './finance/attendance/attendance.component';
import { FollowupAutomationComponent } from './finance/followup-automation/followup-automation.component';
import { IncentiveComponent } from './finance/incentive/incentive.component';
import { ExpenseTrackerComponent } from './finance/expense-tracker/expense-tracker.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { MagicBricksLeadsComponent } from './components/magicbricks-leads/magicbricks-leads.component';
import { NinetyNineAcresLeadComponent } from './components/ninety-nine-acres-lead/ninety-nine-acres-lead.component';
import { EmployeeAddComponent } from './components/employee-add/employee-add.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { HousingWhatsAppComponent } from './components/housing-whatsapp/housing-whatsapp.component';
import { Acres99WhatsAppComponent } from './components/acres99-whatsapp/acres99-whatsapp.component';

const routes: Routes = [
  {
    path: '',
    component: CrmLayoutComponent,
    children: [
      // 👇 Default route to dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // 📊 Dashboard
      { path: 'dashboard', component: CrmDashboardComponent },

      // 📂 Core CRM Modules
      { path: 'lead-management', component: LeadManagementComponent },
      { path: 'property-listing', component: PropertyListingComponent },
      { path: 'client-interaction', component: ClientInteractionComponent },
      { path: 'marketing-outreach', component: MarketingOutreachComponent },
      { path: 'legal-documentation', component: LegalDocumentationComponent },
      { path: 'client-support', component: ClientSupportComponent },
      { path: 'admin-internal', component: AdminInternalComponent },
      { path: 'custom-smart', component: CustomSmartComponent },
      { path: 'payments', component: PaymentListComponent },
      { path: 'payments/add', component: PaymentFormComponent },
      {
        path: 'payments/edit/:id',
        component: PaymentFormComponent,
      },
      { path: 'finance/aging', component: AgingReportComponent },
      { path: 'finance/revenue', component: RevenueDashboardComponent },
      { path: 'finance/attendance', component: AttendanceComponent },
      { path: 'finance/followups', component: FollowupAutomationComponent },
      { path: 'finance/incentives', component: IncentiveComponent },
      { path: 'finance/expenses', component: ExpenseTrackerComponent },
      { path: 'tasks', component: TodoListComponent },
      { path: 'magicbricks-leads', component: MagicBricksLeadsComponent },
      { path: '99acres-leads', component: NinetyNineAcresLeadComponent },
      { path: 'add', component: EmployeeAddComponent },
      { path: 'list', component: EmployeeListComponent },
      { path: 'housing-whatsapp', component: HousingWhatsAppComponent },
        { path: 'acres99-whatsapp', component: Acres99WhatsAppComponent },

      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrmRoutingModule {}
