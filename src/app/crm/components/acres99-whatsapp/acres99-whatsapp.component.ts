import { Component, OnInit } from '@angular/core';
import { WhatsAppLead99acresService } from '@app/services/whatsapp-lead-99acres.service';
 
@Component({
  selector: 'app-acres99-whatsapp',
  templateUrl: './acres99-whatsapp.component.html',
  styleUrls: ['./acres99-whatsapp.component.css']
})
export class Acres99WhatsAppComponent implements OnInit {

  rawMessage: string = '';
  isSubmitting = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  leads: any[] = [];

  constructor(private lead99Service: WhatsAppLead99acresService) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  submitMessage() {
    if (this.isSubmitting) return;

    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    this.lead99Service.saveLeadMessage(this.rawMessage).subscribe({
      next: () => {
        this.successMessage = '✅ 99acres Lead saved!';
        this.rawMessage = '';
        this.isSubmitting = false;
        this.loadLeads();
      },
      error: () => {
        this.errorMessage = '❌ Failed to save lead.';
        this.isSubmitting = false;
      }
    });
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
      }
    });
  }
}
