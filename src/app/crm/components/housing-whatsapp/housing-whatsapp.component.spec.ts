import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HousingWhatsappComponent } from './housing-whatsapp.component';

describe('HousingWhatsappComponent', () => {
  let component: HousingWhatsappComponent;
  let fixture: ComponentFixture<HousingWhatsappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HousingWhatsappComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HousingWhatsappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
