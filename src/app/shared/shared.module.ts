 
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AsyncFilterPipe } from './async-filter.pipe';
import { PricingPlansComponent } from './pricing-plans/pricing-plans.component';
import { UiToastComponent } from './ui-toast/ui-toast.component';
 
@NgModule({
  declarations: [LoaderComponent,LoginComponent,RegisterComponent,AsyncFilterPipe, PricingPlansComponent, UiToastComponent],
  imports: [CommonModule, FormsModule,RouterModule],
  exports: [LoaderComponent,LoginComponent,RegisterComponent,RouterModule,AsyncFilterPipe,UiToastComponent] 
})
export class SharedModule { }
