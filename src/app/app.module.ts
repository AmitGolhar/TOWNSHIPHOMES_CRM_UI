import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from './shared/shared.module';
import { PropertyMapComponent } from './components/property-map/property-map.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ThemeService } from './services/theme.service';
import { ExcelUploadComponent } from './components/excel-upload/excel-upload.component';
import { EmployeeAddComponent } from './crm/components/employee-add/employee-add.component';
import { EmployeeFilterPipe } from './pipes/employee-filter.pipe';
import { ApiInterceptor } from './core/api.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    PropertyMapComponent,
    ThemeToggleComponent,
    ExcelUploadComponent,
    EmployeeAddComponent,
  ],
  imports: [
    BrowserModule,
    InfiniteScrollModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ThemeService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
