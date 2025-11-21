import { Component, OnInit } from '@angular/core';
import { UiToastService, ToastMessage } from '../../services/ui-toast.service';

@Component({
  selector: 'app-ui-toast',
  templateUrl: './ui-toast.component.html',
  styleUrls: ['./ui-toast.component.css']
})
export class UiToastComponent implements OnInit {

  message: ToastMessage | null = null;
  visible = false;

  constructor(private toast: UiToastService) {}

  ngOnInit(): void {
    this.toast.toastState$.subscribe((msg) => {
      this.message = msg;
      this.visible = true;

      setTimeout(() => {
        this.visible = false;
      }, 2500);
    });
  }
}
