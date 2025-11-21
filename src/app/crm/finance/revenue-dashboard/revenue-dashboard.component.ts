import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { FinanceService } from '../services/finance.service';
import { Subscription } from 'rxjs';
import { UiToastService } from '@app/services/ui-toast.service';
 
@Component({
  selector: 'app-revenue-dashboard',
  templateUrl: './revenue-dashboard.component.html',
  styleUrls: ['./revenue-dashboard.component.css']
})
export class RevenueDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  monthly: any[] = [];
  byAgent: any[] = [];
  barChart?: Chart;
  pieChart?: Chart;
  loading = true;
  refreshSub?: Subscription;

  constructor(
    private svc: FinanceService,
    private toast: UiToastService       // ✅ GLOBAL TOAST
  ) {}

  ngOnInit(): void {
    this.refreshSub = this.svc.getRevenue().subscribe({
      next: (data) => {
        if (!data) {
          this.toast.error("⚠️ No revenue data received");
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
        this.toast.error("❌ Failed to load revenue data");
        console.error('Revenue API Error:', err);
      }
    });
  }

  ngAfterViewInit(): void {}

  buildCharts(): void {
    try {
      setTimeout(() => {
        this.buildBarChart();
        this.buildPieChart();
      }, 0);
      this.toast.info("📊 Charts refreshed");
    } catch (e) {
      this.toast.error("❌ Failed to refresh charts");
      console.error(e);
    }
  }

  private buildBarChart(): void {
    const ctx = document.getElementById('revBar') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.barChart) this.barChart.destroy();

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: this.monthly.map(m => m.month),
        datasets: [
          {
            label: 'Collected',
            data: this.monthly.map(m => m.collected),
            backgroundColor: '#28a745'
          },
          {
            label: 'Target',
            data: this.monthly.map(m => m.target),
            backgroundColor: '#007bff'
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
        labels: this.byAgent.map(a => a.agent),
        datasets: [
          {
            data: this.byAgent.map(a => a.collected),
            backgroundColor: [
              '#007bff', '#28a745', '#ffc107', '#17a2b8', '#6f42c1'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.pieChart?.destroy();
    this.refreshSub?.unsubscribe();
  }
}
