import { Component, OnInit } from '@angular/core';
import { WhatsAppLeadHousingService } from '@app/services/whatsapp-lead-housing.service';

@Component({
  selector: 'app-housing-whatsapp',
  templateUrl: './housing-whatsapp.component.html',
  styleUrls: ['./housing-whatsapp.component.css']
})
export class HousingWhatsAppComponent implements OnInit {

  rawMessage: string = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  leads: any[] = [];

  constructor(private housingService: WhatsAppLeadHousingService) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  submitMessage() {
    if (this.isSubmitting) return;

    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    this.housingService.saveLeadMessage(this.rawMessage).subscribe({
      next: () => {
        this.successMessage = "✅ Lead saved successfully!";
        this.rawMessage = '';
        this.isSubmitting = false;

        // Reload list after save
        this.loadLeads();
      },
      error: () => {
        this.errorMessage = "❌ Failed to save lead.";
        this.isSubmitting = false;
      }
    });
  }

  loadLeads() {
    this.isLoading = true;
    this.housingService.getLeadList().subscribe({
      next: (res) => {
        this.leads = res;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
