import { Component, OnInit } from '@angular/core';
import { TodoService } from '@app/services/todo.service';

@Component({
  selector: 'app-followup-automation',
  templateUrl: './followup-automation.component.html',
  styleUrls: ['./followup-automation.component.css'],
})
export class FollowupAutomationComponent implements OnInit {
  followupCount = 0;
  message = '';
  loading = true;
  tasks: any[] = []; // ✅ store task list
  selectedModule = '';
  selectedStatus = '';

  filteredTasks: any[] = [];

  constructor(private svc: TodoService) {}

  ngOnInit(): void {
    this.refreshFollowups();
  }

 refreshFollowups() {
  this.loading = true;

  this.svc.getAutoFollowupsStatus().subscribe({
    next: (res: any) => {
      this.followupCount = res.count;
      this.message = res.message;
      this.tasks = res.tasks || [];

      // ✅ IMPORTANT: populate table
      this.applyFilters();

      this.loading = false;
    },
    error: () => {
      this.message = 'Failed to load follow-up status';
      this.loading = false;
    },
  });
}


 applyFilters() {
  this.filteredTasks = this.tasks.filter(t => {
    const moduleMatch =
      !this.selectedModule || t.module === this.selectedModule;

    const statusMatch =
      !this.selectedStatus || t.status === this.selectedStatus;

    return moduleMatch && statusMatch;
  });
}


  sendEmail(id: number) {
    this.svc.sendFollowup(id).subscribe(() => {
      alert('Email sent ✅');
    });
  }

  sendBulk() {
    this.svc.sendBulkFollowups().subscribe((res: any) => {
      alert(res.sent + ' emails sent ✅');
    });
  }

  exportCSV() {
    const header = 'ID,Title,Module,DueDate,Status,Email\n';
    const rows = this.tasks
      .map(
        (t) =>
          `${t.id},"${t.title}",${t.module},${t.dueDate},${t.status},${
            t.email || ''
          }`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'overdue_tasks.csv';
    link.click();
  }
}
