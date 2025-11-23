import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '@app/environment/environment';
import { TodoTask } from '@app/models/todo-task.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private baseUrl = `${environment.apiUrl}/todo-task-board/all-tasks`;
  private tasks$ = new BehaviorSubject<TodoTask[]>([]);

  constructor(private http: HttpClient, private zone: NgZone) {
    this.loadAll();
    this.initSSE();
  }

  /** ✅ Load initial data */
  private loadAll(): void {
    this.http.get<TodoTask[]>(this.baseUrl).subscribe({
      next: (data) => this.tasks$.next(data),
      error: (err) => console.error('Failed to load tasks:', err)
    });
  }

  /** ✅ SSE real-time stream */
  private initSSE(): void {
    const eventSource = new EventSource(`${this.baseUrl}/stream`);
    eventSource.onmessage = (event) => {
      this.zone.run(() => {
        try {
          const data: TodoTask[] = JSON.parse(event.data);
          this.tasks$.next(data);
        } catch (e) {
          console.error('Invalid SSE data', e);
        }
      });
    };
    eventSource.onerror = (err) => {
      console.warn('SSE connection lost. Retrying...', err);
      eventSource.close();
      setTimeout(() => this.initSSE(), 4000);
    };
  }

  /** ✅ Subscribe to real-time data */
  listen(): Observable<TodoTask[]> {
    return this.tasks$.asObservable();
  }

  /** ✅ Add task (auto-fill backend-required fields) */
  add(task: Partial<TodoTask>): Observable<TodoTask> {
    const fullTask: TodoTask = {
      id: undefined,
      title: task.title || 'Untitled',
      description: task.description || '',
      moduleType: task.moduleType || 'OTHER',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
      category: task.category || 'General Task',
      assignedTo: task.assignedTo || 'Unassigned',
      createdBy: 'System',
      dueDate: task.dueDate || new Date().toISOString().slice(0, 10),
      reminderDate: task.reminderDate || undefined,
      notes: task.notes || '',
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.http.post<TodoTask>(this.baseUrl, fullTask);
  }

  /** ✅ Update task (partial update safe) */
  update(task: Partial<TodoTask>): Observable<TodoTask> {
    if (!task.id) throw new Error('Task ID is required for update.');

    const updatedTask = {
      ...task,
      updatedAt: new Date().toISOString()
    };

    return this.http.put<TodoTask>(`${this.baseUrl}/${task.id}`, updatedTask);
  }

  /** ✅ Delete */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** ✅ Manual load (fallback) */
  getAll(): Observable<TodoTask[]> {
    return this.http.get<TodoTask[]>(this.baseUrl);
  }
}
