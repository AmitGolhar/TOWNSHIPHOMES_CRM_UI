import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UiToastService } from '@app/services/ui-toast.service';
 
@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(private toast: UiToastService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(

      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            if (event.body && event.body.message) {
              this.toast.success(event.body.message);
            }
          }
        },
        error: (err: HttpErrorResponse) => {

          let message = "Unknown error occurred";

          if (err.error?.error) {
            message = err.error.error;         // backend returns {error:"something"}
          } else if (err.error?.message) {
            message = err.error.message;
          } else if (err.message) {
            message = err.message;
          }

          this.toast.error(message);
        }
      })

    );
  }
}
