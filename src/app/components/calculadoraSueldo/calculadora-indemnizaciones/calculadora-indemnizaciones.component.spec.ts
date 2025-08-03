import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculadoraIndemnizacionesComponent } from './calculadora-indemnizaciones.component';

describe('CalculadoraIndemnizacionesComponent', () => {
  let component: CalculadoraIndemnizacionesComponent;
  let fixture: ComponentFixture<CalculadoraIndemnizacionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalculadoraIndemnizacionesComponent]
    });
    fixture = TestBed.createComponent(CalculadoraIndemnizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
