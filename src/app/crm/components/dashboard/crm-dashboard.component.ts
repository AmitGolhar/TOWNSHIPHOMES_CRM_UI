import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AggregatedStat,
  MiniTask,
  Performer,
  DashboardService,
} from '@app/services/dashboard.service';
import { CrmStatsService } from '@app/services/crm-stats.service';

@Component({
  selector: 'app-crm-dashboard',
  templateUrl: './crm-dashboard.component.html',
  styleUrls: ['./crm-dashboard.component.css'],
})
export class CrmDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  totals: AggregatedStat[] = [];
  statusLabels: string[] = [];
  statusCounts: number[] = [];
  moduleLabels: string[] = [];
  moduleCounts: number[] = [];
  moduleColors: string[] = [];

  upcomingTasks: MiniTask[] = [];
  overdueTasks: MiniTask[] = [];
  performers: Performer[] = [];
  userRole: string = '';   

  // FINANCE STATS
  financeStats: any = {
    collectionTarget: 0,
    collectionActual: 0,
    occupancyRate: 0,

    // Payment records
    pendingPayments: 0,
    collectedPayments: 0,

    // New Payment Totals
    totalPaymentAmount: 0,
    totalPaidAmount: 0,
    totalPendingAmount: 0,

    // CRM metrics
    activeLeads: 0,
    dormantLeads: 0,
    totalIncentive: 0,
    totalExpense: 0,

    pendingFollowups: 0,
    completedFollowups: 0,
    attendancePercent: 0,

    monthlyRevenue: [],
    monthlyTarget: [],
  };

  lastUpdated = new Date();
  loading = true;
  currentUser = { name: '', role: '' };

  private subs: Subscription[] = [];
  private barChartRef: any;
  private pieChartRef: any;

  // Finance chart refs
  private collectionChartRef: any;
  private paymentsChartRef: any;
  private revenueChartRef: any;
  private employeeChartRef: any;
  private expenseChartRef: any;
  private totalPaidPendingChartRef: any;

  stats: AggregatedStat[] = [];

  constructor(
    private router: Router,
    private svc: DashboardService,
    private crmStatsService: CrmStatsService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
        this.userRole = sessionStorage.getItem('role') || '';

    setTimeout(() => {
      this.loading = false;
    }, 1200);

    this.refreshAll();

    // CRM totals
    this.crmStatsService.getAll().subscribe((res) => (this.stats = res));

    // RESTORE OLD FOLLOW-UP LOGIC (DO NOT REMOVE)
    this.svc.getTaskStats().subscribe((stats) => {
      this.financeStats.pendingFollowups = stats.pending;
      this.financeStats.completedFollowups = stats.completed;
    });

    // Finance stats
    this.subs.push(
      this.svc.getFinanceStats().subscribe((data) => {
        this.financeStats = { ...this.financeStats, ...data };

        // REBUILD chart after data arrives
        setTimeout(() => {
          this.buildPaymentsChart(); // existing one
          this.buildTotalPaidPendingChart(); // NEW chart
        }, 50);
      })
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.buildTotalPaidPendingChart();

      this.buildCollectionChart();
      this.buildPaymentsChart();
      this.buildRevenueChart();
      this.buildEmployeePerformanceChart();
      this.buildExpenseChart();
    }, 400);
  }

  refreshAll(): void {
    this.loading = true;
    this.lastUpdated = new Date();

    this.subs.push(
      this.svc.getTotals().subscribe((t) => {
        this.totals = t;
        this.moduleLabels = t.map((x) => x.title);
        this.moduleCounts = t.map((x) => x.count);
        this.buildPieChart();
      })
    );

    this.subs.push(
      this.svc.getStatusCounts().subscribe((s) => {
        this.statusLabels = s.labels;
        this.statusCounts = s.counts;
        this.buildBarChart();
      })
    );

    this.subs.push(
      this.svc.getUpcomingTasks(50).subscribe((u) => (this.upcomingTasks = u))
    );

    this.subs.push(
      this.svc.getOverdueTasks(100).subscribe((o) => (this.overdueTasks = o))
    );

    this.subs.push(
      this.svc.getTopPerformers(5).subscribe((p) => (this.performers = p))
    );

    // RESTORED OLD FOLLOW-UP LOGIC IN refreshAll()
    this.svc.getTaskStats().subscribe((stats) => {
      this.financeStats.pendingFollowups = stats.pending;
      this.financeStats.completedFollowups = stats.completed;
    });

    setTimeout(() => {
      this.loading = false;
      this.lastUpdated = new Date();
    }, 400);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  // ------------------------
  // CRM Charts
  // ------------------------

  buildBarChart(): void {
    if (this.barChartRef) this.barChartRef.destroy();
    const ctx = document.getElementById('barChartV2') as HTMLCanvasElement;
    if (!ctx) return;

    this.barChartRef = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.statusLabels,
        datasets: [
          {
            label: 'Tasks',
            data: this.statusCounts,
            backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#6f42c1'],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  buildPieChart(): void {
    if (this.pieChartRef) this.pieChartRef.destroy();
    const ctx = document.getElementById('pieChartV2') as HTMLCanvasElement;
    if (!ctx) return;

    this.pieChartRef = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.moduleLabels,
        datasets: [
          {
            data: this.moduleCounts,
            backgroundColor: this.moduleColors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, font: { size: 11 } },
          },
        },
      },
    });
  }

  // ------------------------
  // FINANCE CHARTS
  // ------------------------

  private buildCollectionChart(): void {
    if (this.collectionChartRef) this.collectionChartRef.destroy();
    const ctx = document.getElementById('collectionChart') as HTMLCanvasElement;
    if (!ctx) return;

    const weeklyActual = this.financeStats.collectedPayments / 4;
    const weeklyTarget = this.financeStats.collectionTarget / 4;

    this.collectionChartRef = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Collected',
            data: [weeklyActual, weeklyActual, weeklyActual, weeklyActual],
            backgroundColor: '#28a745',
          },
          {
            label: 'Target',
            data: [weeklyTarget, weeklyTarget, weeklyTarget, weeklyTarget],
            backgroundColor: '#007bff',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }

  private buildPaymentsChart(): void {
    if (this.paymentsChartRef) this.paymentsChartRef.destroy();
    const ctx = document.getElementById('paymentsChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.paymentsChartRef = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Collected (Paid)', 'Pending'],
        datasets: [
          {
            data: [
              this.financeStats.collectedPayments || 0,
              this.financeStats.pendingPayments || 0,
            ],
            backgroundColor: ['#198754', '#dc3545'],
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  private buildRevenueChart(): void {
    if (this.revenueChartRef) this.revenueChartRef.destroy();
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.revenueChartRef = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [
          {
            label: 'Collected',
            data: this.financeStats.monthlyRevenue,
            borderColor: '#198754',
            fill: true,
          },
          {
            label: 'Target',
            data: this.financeStats.monthlyTarget,
            borderColor: '#0d6efd',
            borderDash: [5, 5],
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }

  private buildEmployeePerformanceChart(): void {
    if (this.employeeChartRef) this.employeeChartRef.destroy();
    const ctx = document.getElementById('employeeChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.employeeChartRef = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Neha', 'Ravi', 'Amit', 'Pooja', 'Sanjay'],
        datasets: [
          {
            label: 'Visits',
            data: [10, 8, 5, 6, 7],
            backgroundColor: '#ffc107',
          },
          {
            label: 'Tasks Closed',
            data: [12, 9, 6, 5, 8],
            backgroundColor: '#0d6efd',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }

  private buildExpenseChart(): void {
    if (this.expenseChartRef) this.expenseChartRef.destroy();
    const ctx = document.getElementById('expenseChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.expenseChartRef = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [
          {
            label: 'Expenses',
            data: [
              this.financeStats.totalExpense / 4,
              this.financeStats.totalExpense / 4,
              this.financeStats.totalExpense / 4,
              this.financeStats.totalExpense / 4,
            ],
            borderColor: '#dc3545',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }

  private buildTotalPaidPendingChart(): void {
    if (this.totalPaidPendingChartRef) {
      this.totalPaidPendingChartRef.destroy();
    }

    const ctx = document.getElementById(
      'totalPaidPendingChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    this.totalPaidPendingChartRef = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Amount', 'Paid Amount', 'Pending Amount'],
        datasets: [
          {
            label: 'Amount (₹)',
            data: [
              this.financeStats.totalPaymentAmount || 0,
              this.financeStats.totalPaidAmount || 0,
              this.financeStats.totalPendingAmount || 0,
            ],
            backgroundColor: ['#0d6efd', '#198754', '#dc3545'],
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  }

  loadUserInfo() {
    this.currentUser.name = sessionStorage.getItem('fullName') || 'Unknown';
    this.currentUser.role = sessionStorage.getItem('role') || 'USER';
  }

  ngOnDestroy(): void {
    if (this.totalPaidPendingChartRef) {
      this.totalPaidPendingChartRef.destroy();
    }

    this.subs.forEach((s) => s.unsubscribe());
    [
      this.barChartRef,
      this.pieChartRef,
      this.collectionChartRef,
      this.paymentsChartRef,
      this.revenueChartRef,
      this.employeeChartRef,
      this.expenseChartRef,
      this.totalPaidPendingChartRef,
    ].forEach((ch) => ch?.destroy());
  }

  get monthlyRevenueTotal(): number {
    return this.financeStats?.monthlyRevenue
      ? this.financeStats.monthlyRevenue.reduce((a: any, b: any) => a + b, 0)
      : 0;
  }


   isAdmin(): boolean {
    return this.userRole.toLowerCase().includes('ADMIN');
  }
}
