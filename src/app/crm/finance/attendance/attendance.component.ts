import { Component, OnInit } from '@angular/core';
import { AttendanceRecord } from '../modal/attendance.model';
import { AttendanceService } from '../services/attendance.service';
import { UiToastService } from '@app/services/ui-toast.service';
 
@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  employeeName = 'Amit';  
  records: AttendanceRecord[] = [];
  todayRecord?: AttendanceRecord;

  visits = 0;
  tasks = 0;
  isCheckedIn = false;

  isProcessing = false;   // 🔥 Disable buttons & show loading

  constructor(
    private svc: AttendanceService,
    private toast: UiToastService       // 🔥 Inject toast
  ) {}

  ngOnInit(): void {
    this.load();

    this.svc.connectStream().subscribe((records) => {
      this.records = records.sort((a, b) => b.id - a.id);
    });
  }

  load(): void {
    this.svc.getAttendance().subscribe({
      next: (r) => {
        this.records = r.sort((a, b) => b.id - a.id);

        this.todayRecord = this.records.find(
          rec =>
            rec.employee === this.employeeName &&
            rec.date === new Date().toISOString().slice(0, 10)
        );

        this.isCheckedIn = !!(this.todayRecord && !this.todayRecord.checkOut);

        if (this.todayRecord) {
          this.visits = this.todayRecord.visits || 0;
          this.tasks = this.todayRecord.tasksClosed || 0;
        }
      },
      error: () => this.toast.error("❌ Unable to load attendance records")
    });
  }

  checkIn(): void {
    this.isProcessing = true;

    this.svc.checkIn(this.employeeName).subscribe({
      next: () => {
        this.toast.success("✅ Checked-in successfully!");
        this.load();
      },
      error: () => this.toast.error("❌ Check-in failed"),
      complete: () => (this.isProcessing = false)
    });
  }

  checkOut(): void {
    this.isProcessing = true;

    this.svc.updateVisits(this.employeeName, this.visits, this.tasks).subscribe({
      next: () => {
        this.svc.checkOut(this.employeeName).subscribe({
          next: () => {
            this.toast.success("🚪 Checked-out successfully!");
            this.load();
          },
          error: () => this.toast.error("❌ Checkout failed"),
          complete: () => (this.isProcessing = false)
        });
      },
      error: () => {
        this.toast.error("❌ Failed to update visits/tasks");
        this.isProcessing = false;
      }
    });
  }

  updateMetrics(): void {
    if (!this.isCheckedIn) return;

    this.svc.updateVisits(this.employeeName, this.visits, this.tasks).subscribe({
      next: () => this.toast.info("📊 Metrics updated"),
      error: () => this.toast.error("❌ Unable to update metrics")
    });
  }
}
