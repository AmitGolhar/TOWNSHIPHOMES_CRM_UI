import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { FinanceService } from '../services/finance.service';
import { Subscription } from 'rxjs';
import { UiToastService } from '@app/services/ui-toast.service';
import { PaymentService } from '../payment.service';

@Component({
  selector: 'app-revenue-dashboard',
  templateUrl: './revenue-dashboard.component.html',
  styleUrls: ['./revenue-dashboard.component.css'],
})
export class RevenueDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  monthly: any[] = [];
  byAgent: any[] = [];
  barChart?: Chart;
  pieChart?: Chart;
  loading = true;
  refreshSub?: Subscription;
  employeeStats: any[] = [];

  constructor(
    private svc: FinanceService,
    private toast: UiToastService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.refreshSub = this.svc.getRevenue().subscribe({
      next: (data) => {
        if (!data) {
          this.toast.error('⚠️ No revenue data received');
          this.loading = false;
          return;
        }
        this.monthly = data.monthly || [];
        this.byAgent = data.byAgent || [];

        this.loading = false;
        this.buildCharts();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error('❌ Failed to load revenue data');
        console.error('Revenue API Error:', err);
      },
    });

   this.paymentService.getEmployeeRevenue().subscribe((data) => {
  this.employeeStats = (data || []).map(e => {
    const target = e.collected + e.pending;
    const percentage = target > 0 ? (e.collected / target) * 100 : 0;

    return {
      ...e,
      target,
      percentage
    };
  });

  this.buildCharts(); // still needed
});

  }

  ngAfterViewInit(): void {}

  buildCharts(): void {
    try {
      setTimeout(() => {
        this.buildBarChart();
        this.buildPieChart();
      }, 0);
      this.toast.info('📊 Charts refreshed');
    } catch (e) {
      this.toast.error('❌ Failed to refresh charts');
      console.error(e);
    }
  }

  private buildBarChart(): void {
  const ctx = document.getElementById('revBar') as HTMLCanvasElement;
  if (!ctx) return;

  if (this.barChart) this.barChart.destroy();

  const labels = this.employeeStats.map(e => e.employee);

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Collected',
          data: this.employeeStats.map(e => e.collected),
          backgroundColor: '#28a745'
        },
        {
          label: 'Pending',
          data: this.employeeStats.map(e => e.pending),
          backgroundColor: '#ffc107'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  };

  this.barChart = new Chart(ctx, config);
}


  private buildPieChart(): void {
    const ctx2 = document.getElementById('revPie') as HTMLCanvasElement;
    if (!ctx2) return;

    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: this.employeeStats.map((e) => e.employee),
        datasets: [
          {
            label: 'Collected',
            data: this.employeeStats.map((e) => e.collected),
            backgroundColor: [
              '#007bff',
              '#28a745',
              '#ffc107',
              '#17a2b8',
              '#6f42c1',
              '#dc3545',
              '#20c997',
              '#6610f2',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.pieChart?.destroy();
    this.refreshSub?.unsubscribe();
  }
}
