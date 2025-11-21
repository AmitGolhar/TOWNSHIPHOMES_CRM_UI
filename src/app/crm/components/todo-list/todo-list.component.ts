import {
  Component,
  OnInit,
  AfterViewInit,
  QueryList,
  ViewChildren,
  OnDestroy,
} from '@angular/core';

import {
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { ModuleType, TodoTask } from '@app/models/todo-task.model';
import { TodoService } from '@app/services/todo.service';
import { EmployeeService } from '@app/services/employee.service';
import { Employee } from '@app/models/employee.model';

import { Subscription } from 'rxjs';
import { UiToastService } from '@app/services/ui-toast.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
})
export class TodoListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(CdkDropList) dropListRefs!: QueryList<CdkDropList>;
  dropLists: CdkDropList[] = [];

  tasks: TodoTask[] = [];
  employees: Employee[] = [];
  selectedEmployeeEmail: string | null = null;
  isDragSaving = false;

  /** Kanban Columns */
  columns = [
    { status: 'Pending', tasks: [] as TodoTask[] },
    { status: 'In Progress', tasks: [] as TodoTask[] },
    { status: 'On Hold', tasks: [] as TodoTask[] },
    { status: 'Completed', tasks: [] as TodoTask[] },
    { status: 'Cancelled', tasks: [] as TodoTask[] },
  ];

  editing?: TodoTask | null = null;

  // Drag modal state (A1.1)
  dragModalVisible = false;
  dragModalTask?: TodoTask | null = null;
  dragModalOldStatus = '';
  dragModalNewStatus = '';
  dragModalNote = '';
  isSaving = false;

  // Full list of task titles (keep your full list)
  taskTitleOptions: string[] = [
    'New Lead Follow-Up',
    'Call / WhatsApp Follow-Up',
    'Send Property Details',
    'Schedule Site Visit',
    'Update Lead Status',
    'Lead Assignment',
    'Lead Qualification',
    'Record Feedback / Notes',
    'Negotiation / Offer Discussion',
    'Booking Confirmation',
    'Re-Engage Dormant Lead',
    'Close / Lost Lead Reason',
    'Site Visit Scheduling',
    'Site Visit Follow-Up',
    'Pickup & Drop Coordination',
    'Office Meeting / Consultation',
    'Document Collection',
    'Agreement Signing',
    'Payment Collection / Receipt',
    'Feedback / Testimonial Collection',
    'Property Handover / Key Delivery',
    'Post-Sale Support / Maintenance Request',
    'Campaign Follow-Up',
    'Social Media Post / Boost',
    'Lead Source Analysis',
    'Listing Promotion / Refresh',
    'Creative / Brochure Design',
    'Email / SMS Blast',
    'Ad Budget Optimization',
    'Performance Reporting',
    'Agreement Preparation',
    'Document Verification',
    'Registration Coordination',
    'Invoice / Receipt Generation',
    'Payment Reconciliation',
    'Legal Clearance Check',
    'NOC / Builder Document Collection',
    'Stamp Duty & Tax Filing',
    'Handover Scheduling',
    'Post-Sale Support',
    'Maintenance Request',
    'Repair / Service Coordination',
    'Client Feedback Collection',
    'Warranty / AMC Management',
    'Complaint Resolution',
    'Follow-Up Visit / Call',
    'Team Meeting / Briefing',
    'Report Submission',
    'CRM Data Update / Cleanup',
    'Training / Onboarding',
    'Office Maintenance / Supplies',
    'System Access Setup',
    'Inventory Management',
    'Compliance / Audit Task',
    'SLA Breach Alert',
    'Auto Lead Assignment',
    'Smart Task Suggestion',
    'Auto Task Creation',
    'AI Lead Prioritization',
    'System Sync Alert',
  ];

  // map title -> module string
  taskModuleMap: { [key: string]: string } = {
    'New Lead Follow-Up': 'LEAD',
    'Call / WhatsApp Follow-Up': 'LEAD',
    'Schedule Site Visit': 'LEAD',
    'Lead Assignment': 'LEAD',
    'Booking Confirmation': 'LEAD',
    'Site Visit Scheduling': 'CLIENT_INTERACTION',
    'Office Meeting / Consultation': 'CLIENT_INTERACTION',
    'Agreement Signing': 'CLIENT_INTERACTION',
    'Campaign Follow-Up': 'MARKETING',
    'Social Media Post / Boost': 'MARKETING',
    'Listing Promotion / Refresh': 'MARKETING',
    'Agreement Preparation': 'LEGAL',
    'Document Verification': 'LEGAL',
    'Registration Coordination': 'LEGAL',
    'Team Meeting / Briefing': 'ADMIN',
    'Report Submission': 'ADMIN',
    'System Access Setup': 'ADMIN',
    'Maintenance Request': 'AFTER_SALES',
    'Complaint Resolution': 'AFTER_SALES',
    'Smart Task Suggestion': 'SMART',
    'Auto Task Creation': 'SMART',
  };

  private liveSub?: Subscription;

  constructor(
    private svc: TodoService,
    private empService: EmployeeService,
    private toast: UiToastService
  ) {}

  // ---------------------------------------------------
  // INIT
  // ---------------------------------------------------
  ngOnInit(): void {
    console.log('🔥 INIT → Loading employees first...');

    this.empService.getAllEmployees().subscribe({
      next: (res) => {
        this.employees = res || [];
        console.log('✔ Employees loaded:', this.employees);

        // Now load tasks AFTER employees load
        this.loadTasks();
        this.initLiveStream();
      },
      error: (err) => {
        console.error('❌ Employee API failed:', err);
        this.employees = [];

        // Still load tasks to avoid blank screen
        this.loadTasks();
        this.initLiveStream();
      },
    });
  }

  loadTasks() {
    console.log('📥 Loading tasks...');
    this.svc.getAll().subscribe({
      next: (list) => {
        console.log('✔ Tasks loaded:', list);
        this.tasks = this.mapEmployeeNames(list || []);
        this.refreshColumns();
      },
      error: (err) => console.error('❌ Failed to load tasks:', err),
    });
  }

  initLiveStream() {
    console.log('🌐 Starting SSE...');
    this.liveSub = this.svc.listen().subscribe({
      next: (list) => {
        console.log('📡 SSE update:', list);
        this.tasks = this.mapEmployeeNames(list || []);
        this.refreshColumns();
      },
      error: (err) => console.error('❌ SSE stream failed:', err),
    });
  }

  ngAfterViewInit(): void {
    this.dropLists = this.dropListRefs.toArray();
  }

  ngOnDestroy(): void {
    this.liveSub?.unsubscribe();
  }

  // ---------------------------------------------------
  // Map employee id → name for display and include assignedEmail if possible
  // ---------------------------------------------------
  mapEmployeeNames(list: TodoTask[]): TodoTask[] {
    if (!this.employees || this.employees.length === 0) {
      console.warn('⚠️ Employees not loaded yet!');
      return list; // return tasks as-is
    }

    return list.map((t) => {
      const emp = this.employees.find(
        (e) => String(e.id) === String(t.assignedTo)
      );
      return {
        ...t,
        assignedToName: emp?.name || '-',
        assignedEmail: emp?.email || null,
      };
    });
  }

  // helper used by template to display assigned email quickly
  updateAssignedEmailView(): void {
    const emp = this.employees.find(
      (e) => String(e.id) === String(this.editing?.assignedTo)
    );
    this.selectedEmployeeEmail = emp?.email || null;
  }

  getAssignedEmailDisplay(): string {
    if (this.editing && (this.editing as any).assignedEmail) {
      return (this.editing as any).assignedEmail;
    }
    if (!this.editing) return 'No employee selected';
    const assignedId = this.editing.assignedTo;
    if (!assignedId) return 'No employee selected';
    const emp = this.employees.find((e) => String(e.id) === String(assignedId));
    return emp?.email || 'No employee selected';
  }

  // ---------------------------------------------------
  // Columns refresh
  // ---------------------------------------------------
  refreshColumns(): void {
    this.columns.forEach((c) => (c.tasks = []));
    this.tasks.forEach((t) => {
      const col = this.columns.find((c) => c.status === t.status);
      (col?.tasks || this.columns[0].tasks).push(t);
    });
  }

  // ---------------------------------------------------
  // Drag & drop -> open small modal that requires note (A1.1)
  // ---------------------------------------------------
  drop(event: CdkDragDrop<TodoTask[]>, status: string): void {
    // keep original arrays so we can revert on cancel/error
    const prevList = event.previousContainer.data;
    const currList = event.container.data;

    if (event.previousContainer === event.container) {
      // reorder in same list
      moveItemInArray(currList, event.previousIndex, event.currentIndex);
      return;
    }

    // transfer item visually first
    transferArrayItem(
      prevList,
      currList,
      event.previousIndex,
      event.currentIndex
    );

    const moved = currList[event.currentIndex];
    if (!moved) return;

    const oldStatus = moved.status;
    const newStatus = status as any; // we'll cast for type-safety later

    // if no change in status (shouldn't happen) simply return
    if (oldStatus === newStatus) return;

    // prepare drag modal data (do not send yet)
    this.openDragModal(moved, oldStatus, newStatus);
  }

  // ---------------------------------------------------
  // Open small drag modal
  // ---------------------------------------------------
  openDragModal(task: TodoTask, oldStatus: string, newStatus: string): void {
    this.dragModalTask = { ...task }; // copy so UI edits are isolated
    this.dragModalOldStatus = oldStatus;
    this.dragModalNewStatus = newStatus;
    this.dragModalNote = '';
    this.dragModalVisible = true;
  }

  // Save action from drag modal -> validation + send to backend
  saveDragModal(): void {
    if (this.isDragSaving) return;
    this.isDragSaving = true;

    if (!this.dragModalTask) return;

    const note = (this.dragModalNote || '').trim();
    if (!note) {
      this.toast.showError('Note is required before changing status ⚠️');
      this.isDragSaving = false;
      return;
    }

    this.dragModalTask.status = this.dragModalNewStatus as any;
    this.dragModalTask.notes = this.dragModalTask.notes
      ? `${this.dragModalTask.notes}\n[Status Change] ${note}`
      : `[Status Change] ${note}`;

    (this.dragModalTask as any).lastStatus = this.dragModalOldStatus;
    this.applyAssignedEmail(this.dragModalTask);

    const payload = this.stripUiFields(this.dragModalTask);

    this.svc.update(payload).subscribe({
      next: () => {
        this.toast.showSuccess('Status updated ✔');
        this.dragModalVisible = false;
        this.dragModalTask = null;
        this.dragModalNote = '';
        this.isDragSaving = false;

        this.loadTasks();
      },
      error: (err) => {
        console.error(err);
        this.toast.showError('Status update failed ❌');
        this.isDragSaving = false;
      },
    });
  }

  // Cancel drag modal -> revert UI by reloading from server
  cancelDragModal(): void {
    this.dragModalVisible = false;
    this.dragModalTask = null;
    this.dragModalNote = '';
    // reload canonical state from server
    this.svc.getAll().subscribe({
      next: (list) => {
        this.tasks = this.mapEmployeeNames(list || []);
        this.refreshColumns();
      },
      error: (err) => console.error('Failed to reload tasks on cancel:', err),
    });
  }

  // ---------------------------------------------------
  // Overdue check
  // ---------------------------------------------------
  isOverdue(t: TodoTask): boolean {
    return t.dueDate
      ? t.status !== 'Completed' &&
          t.dueDate < new Date().toISOString().slice(0, 10)
      : false;
  }

  // ---------------------------------------------------
  // Add / Edit / Close
  // ---------------------------------------------------
  add(): void {
    this.editing = {
      title: '',
      moduleType: 'RENT' as ModuleType,
      priority: 'Medium',
      status: 'Pending',
    } as TodoTask;
  }

  edit(task: TodoTask): void {
    this.editing = { ...task };
    // refresh email display
    this.updateAssignedEmailView();
  }

  closeForm(): void {
    this.editing = null;
  }

  // ---------------------------------------------------
  // Save (create or update) — send cleaned payload
  // ---------------------------------------------------
  save(task: TodoTask): void {
    if (this.isSaving) return; // avoid duplicate clicks
    this.isSaving = true;

    // Track old status if changed
    if (task.id) {
      const original = this.tasks.find((t) => t.id === task.id);
      if (original && original.status !== task.status) {
        (task as any).lastStatus = original.status;
      }
    }

    this.applyAssignedEmail(task);
    const cleaned = this.stripUiFields(task);

    const req = cleaned.id ? this.svc.update(cleaned) : this.svc.add(cleaned);

    req.subscribe({
      next: () => {
        this.toast.showSuccess('Task saved successfully ✔');
        this.editing = null;
        this.isSaving = false;
      },
      error: (err) => {
        this.toast.showError('Failed to save task ❌');
        this.isSaving = false;
        console.error(err);
      },
    });
  }

  // ---------------------------------------------------
  // Ensure assignedEmail is set from employees list (employee id → email)
  // ---------------------------------------------------
  applyAssignedEmail(task: Partial<TodoTask> & { assignedTo?: any }): void {
    if (!task) return;
    const aid = task.assignedTo;

    if (aid === null || aid === undefined || aid === '') {
      (task as any).assignedEmail = null;
      return;
    }

    const emp = this.employees.find((e) => String(e.id) === String(aid));

    if (emp) {
      task.assignedTo = String(emp.id);
      (task as any).assignedEmail = emp.email || null;
    } else {
      if (typeof aid === 'string' && aid.includes('@')) {
        (task as any).assignedEmail = aid;
      } else {
        (task as any).assignedEmail = null;
      }
    }
  }

  // ---------------------------------------------------
  // Remove UI-only fields before sending to backend
  // ---------------------------------------------------
  stripUiFields(task: any): any {
    if (!task) return task;
    const cleaned = { ...task };

    // Remove transient/display-only fields we added in UI
    delete cleaned.assignedToName;
    delete cleaned.lastStatus;
    delete cleaned.statusChanged;
    delete cleaned._tempId;
    delete cleaned.__v;

    return cleaned;
  }

  // ---------------------------------------------------
  // Auto set module based on task title
  // ---------------------------------------------------
  autoSetModule(): void {
    if (!this.editing) return;
    const module = this.taskModuleMap[this.editing.title];
    if (module) {
      // cast to ModuleType
      this.editing.moduleType = module as unknown as ModuleType;
    }
  }

  // ---------------------------------------------------
  // Delete
  // ---------------------------------------------------
  delete(t: TodoTask): void {
    if (t.id && confirm(`Delete task "${t.title}"?`)) {
      this.svc.delete(t.id).subscribe({
        next: () => console.log('🗑️ Deleted'),
        error: (err) => console.error('❌ Delete failed:', err),
      });
    }
  }
}
