import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceTicketsComponent } from './service-tickets.component';

describe('ServiceTicketsComponent', () => {
  let component: ServiceTicketsComponent;
  let fixture: ComponentFixture<ServiceTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceTicketsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
