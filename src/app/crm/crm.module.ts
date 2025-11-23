import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CrmRoutingModule } from './crm-routing.module';
 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterPipe } from './filter.pipe';
 import { CrmDashboardComponent } from './components/dashboard/crm-dashboard.component';
import { FinanceModule } from './finance/finance.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TodoListComponent } from './components/todo-list/todo-list.component';
 import { AdminInternalComponent } from './components/admin-internal/admin-internal.component';
import { ClientInteractionComponent } from './components/client-interaction/client-interaction.component';
import { ClientSupportComponent } from './components/client-support/client-support.component';
import { CustomSmartComponent } from './components/custom-smart/custom-smart.component';
import { LeadManagementComponent } from './components/lead-management/lead-management.component';
import { LegalDocumentationComponent } from './components/legal-documentation/legal-documentation.component';
import { MarketingOutreachComponent } from './components/marketing-outreach/marketing-outreach.component';
import { PropertyListingComponent } from './components/property-listing/property-listing.component';
import { CrmLayoutComponent } from './crm-layout/crm-layout.component';
 import { SharedModule } from '@app/shared/shared.module';
import { MagicBricksLeadsComponent } from './components/magicbricks-leads/magicbricks-leads.component';
import { NinetyNineAcresLeadComponent } from './components/ninety-nine-acres-lead/ninety-nine-acres-lead.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeFilterPipe } from '@app/pipes/employee-filter.pipe';
import { HousingWhatsAppComponent } from './components/housing-whatsapp/housing-whatsapp.component';
import { Acres99WhatsAppComponent } from './components/acres99-whatsapp/acres99-whatsapp.component';
import { ServiceTicketsComponent } from './components/service-tickets/service-tickets.component';
   

@NgModule({
  declarations: [
    CrmLayoutComponent,
    LeadManagementComponent,
    PropertyListingComponent,
    ClientInteractionComponent,
    MarketingOutreachComponent,
    LegalDocumentationComponent,
    ClientSupportComponent,
    AdminInternalComponent,
    CustomSmartComponent,
    FilterPipe,
    CrmDashboardComponent,
    TodoListComponent,
    MagicBricksLeadsComponent,
    NinetyNineAcresLeadComponent,
    EmployeeListComponent,
     EmployeeFilterPipe,
     HousingWhatsAppComponent,
     Acres99WhatsAppComponent,
     ServiceTicketsComponent
    
  ],
  imports: [
 
    CommonModule,
 
    CrmRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    FinanceModule,
    DragDropModule,
     SharedModule
  ]
})
export class CrmModule { }
