import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiToastService {

  private toastSubject = new Subject<ToastMessage>();
  toastState$ = this.toastSubject.asObservable();

  // Show success toast
  success(message: string) {
    this.toastSubject.next({ type: 'success', text: message });
  }

  // Show error toast
  error(message: string) {
    this.toastSubject.next({ type: 'error', text: message });
  }

  // Show info toast
  info(message: string) {
    this.toastSubject.next({ type: 'info', text: message });
  }

  // Show warning toast
  warning(message: string) {
    this.toastSubject.next({ type: 'warning', text: message });
  }
   // 🆕 Wrapper methods (to fix component errors)
  showSuccess(message: string) {
    this.success(message);
  }

  showError(message: string) {
    this.error(message);
  }

  showInfo(message: string) {
    this.info(message);
  }

  showWarning(message: string) {
    this.warning(message);
  }
}
