import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Acres99WhatsappComponent } from './acres99-whatsapp.component';

describe('Acres99WhatsappComponent', () => {
  let component: Acres99WhatsappComponent;
  let fixture: ComponentFixture<Acres99WhatsappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Acres99WhatsappComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Acres99WhatsappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
