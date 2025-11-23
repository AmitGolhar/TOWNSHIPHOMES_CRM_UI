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
import { EmployeeService } from '@app/services/employee.service';

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
  private overdueTasksChartRef: any;
  private paymentsChartRef: any;
  private revenueChartRef: any;
  private employeeChartRef: any;
  private expenseChartRef: any;
  private totalPaidPendingChartRef: any;

  stats: AggregatedStat[] = [];
  followupStats = {
    pending: 0,
    completed: 0,
  };
  employees: any[] = [];
  employeeMap: any = {};

  constructor(
    private router: Router,
    private svc: DashboardService,
    private crmStatsService: CrmStatsService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadEmployees(); // ✅ ADD THIS
    this.userRole = sessionStorage.getItem('role') || '';

    setTimeout(() => {
      this.loading = false;
    }, 1200);

    this.refreshAll();

    // CRM totals
    this.crmStatsService.getAll().subscribe((res) => (this.stats = res));

    // RESTORE OLD FOLLOW-UP LOGIC (DO NOT REMOVE)
    this.svc.getTaskStats().subscribe((stats) => {
      this.followupStats.pending = stats.pending;
      this.followupStats.completed = stats.completed;
    });

    this.subs.push(
      this.svc.getFinanceStats().subscribe((data) => {
        this.financeStats = { ...this.financeStats, ...data };

        setTimeout(() => {
          this.buildPaymentsChart();
          this.buildTotalPaidPendingChart();
          this.buildExpenseChart();
          this.buildRevenueChart();
        }, 300);
      })
    );
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (list) => {
        this.employees = list || [];

        // 🔥 ID → NAME map
        this.employeeMap = {};
        this.employees.forEach((emp) => {
          this.employeeMap[String(emp.id)] = emp.name;
        });
      },
      error: () => console.error('Failed to load employees'),
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.buildTotalPaidPendingChart();

      this.buildOverdueTasksChart();
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
      this.svc.getOverdueTasks(100).subscribe((o) => {
        this.overdueTasks = o;

        setTimeout(() => {
          this.buildOverdueTasksChart();
        }, 100);
      })
    );

    this.subs.push(
      this.svc.getTopPerformers(5).subscribe((p) => {
        this.performers = p || [];
        setTimeout(() => this.buildEmployeePerformanceChart(), 100);
      })
    );

    this.svc.getTaskStats().subscribe((stats) => {
      this.followupStats.pending = stats.pending;
      this.followupStats.completed = stats.completed;
    });

    setTimeout(() => {
      this.loading = false;
      this.lastUpdated = new Date();
    }, 400);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
  getEmployeeName(id?: string): string {
    if (!id) return '-';
    return this.employeeMap[String(id)] || '-';
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
  private buildOverdueTasksChart(): void {
    if (this.overdueTasksChartRef) this.overdueTasksChartRef.destroy();

    const ctx = document.getElementById(
      'OverdueTasksChart'
    ) as HTMLCanvasElement;
    if (!ctx) return;

    if (!this.overdueTasks || this.overdueTasks.length === 0) return;

    // ✅ Group overdue tasks by module
    const overdueByModule: { [key: string]: number } = {};

    this.overdueTasks.forEach((task) => {
      const moduleName = task.module || 'Unknown';
      overdueByModule[moduleName] = (overdueByModule[moduleName] || 0) + 1;
    });

    const labels = Object.keys(overdueByModule);
    const values = Object.values(overdueByModule);

    this.overdueTasksChartRef = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Overdue Tasks',
            data: values,
            backgroundColor: '#dc3545',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
          },
        },
      },
    });
  }

  private buildPaymentsChart(): void {
    if (this.paymentsChartRef) this.paymentsChartRef.destroy();

    const ctx = document.getElementById('paymentsChart') as HTMLCanvasElement;
    if (!ctx) return;

    const paid = Number(this.financeStats.totalPaidAmount || 0);
    const pending = Number(this.financeStats.totalPendingAmount || 0);

    this.paymentsChartRef = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Collected', 'Pending'],
        datasets: [
          {
            data: [paid, pending],
            backgroundColor: ['#198754', '#dc3545'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  private buildRevenueChart(): void {
    if (!this.isAdmin()) return;

    setTimeout(() => {
      const canvas = document.getElementById(
        'revenueChart'
      ) as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Revenue canvas NOT FOUND');
        return;
      }

      if (this.revenueChartRef) this.revenueChartRef.destroy();

      this.revenueChartRef = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Actual Revenue', 'Target'],
          datasets: [
            {
              label: 'Amount (₹)', // ✅ THIS FIXES "undefined"
              data: [
                Number(this.financeStats.totalPaidAmount || 0),
                Number(this.financeStats.collectionTarget || 0),
              ],
              backgroundColor: ['#198754', '#0d6efd'],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false, // change to false if you want ultra-clean UI
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }, 200);
  }

  private buildEmployeePerformanceChart(): void {
    if (this.employeeChartRef) {
      this.employeeChartRef.destroy();
    }

    const ctx = document.getElementById('employeeChart') as HTMLCanvasElement;
    if (!ctx || !this.performers.length) return;

    const labels = this.performers.map((p) => p.name);
    const closedTasks = this.performers.map((p) => p.closed || 0);

    console.log('Employee Performance Data:', this.performers);

    this.employeeChartRef = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Tasks Closed',
            data: closedTasks,
            backgroundColor: '#0d6efd',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });
  }

  private buildExpenseChart(): void {
    if (!this.isAdmin()) return;

    setTimeout(() => {
      const canvas = document.getElementById(
        'expenseChart'
      ) as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Expense canvas NOT FOUND');
        return;
      }

      if (this.expenseChartRef) this.expenseChartRef.destroy();

      this.expenseChartRef = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Expense', 'Incentive'],
          datasets: [
            {
              label: 'Amount (₹)', // ✅ THIS REMOVES "undefined"
              data: [
                Number(this.financeStats.totalExpense || 0),
                Number(this.financeStats.totalIncentive || 0),
              ],
              backgroundColor: ['#dc3545', '#ffc107'],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }, 200);
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
      this.overdueTasksChartRef,
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
    return this.userRole.toUpperCase().includes('ADMIN');
  }
}
