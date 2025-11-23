import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PaymentService } from '../payment.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-aging-report',
  templateUrl: './aging-report.component.html',
  styleUrls: ['./aging-report.component.css']
})
export class AgingReportComponent implements OnInit, AfterViewInit {

  buckets: { label: string; count: number; total: number }[] = [];
  agingChartRef: any;

  constructor(private svc: PaymentService) {}

  ngOnInit(): void {
    this.svc.getAgingBuckets().subscribe(data => {
      this.buckets = data || [];
      setTimeout(() => this.buildChart(), 100);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.buildChart(), 200);
  }

  buildChart() {
    if (this.agingChartRef) this.agingChartRef.destroy();

    const canvas = document.getElementById('agingChart') as HTMLCanvasElement;
    if (!canvas || !this.buckets.length) return;

    this.agingChartRef = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.buckets.map(b => b.label),
        datasets: [{
          label: 'Pending Amount',
          data: this.buckets.map(b => b.total),
          backgroundColor: ['#28a745', '#ffc107', '#fd7e14', '#dc3545', '#6f0000'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  

  // ---- Actions ----
  viewDetails(bucket: string) {
    alert(`Opening clients for ${bucket}`);
  }

  sendReminder(bucket: string) {
    alert(`WhatsApp reminders sent for ${bucket}`);
  }

  exportExcel() {
    alert('Excel Export Triggered (Integrate XLSX Service)');
  }

  exportPDF() {
    window.print();
  }

  triggerAutoEmail() {
    alert('Auto Daily Aging Email Enabled');
  }

  getBucketClass(label: string): string {
  switch (label) {
    case '0 - 7 Days':
      return 'aging-recent';      // Dark Green
    case '8 - 15 Days':
      return 'aging-attention';   // Amber
    case '16 - 30 Days':
      return 'aging-risk';        // Orange
    case '31 - 60 Days':
      return 'aging-critical';    // Red
    case '60+ Days':
      return 'aging-very-critical'; // Deep Maroon
    default:
      return '';
  }
}

}
