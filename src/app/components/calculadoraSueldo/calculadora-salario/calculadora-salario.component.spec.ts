import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculadoraSalarioComponent } from './calculadora-salario.component';

describe('CalculadoraSalarioComponent', () => {
  let component: CalculadoraSalarioComponent;
  let fixture: ComponentFixture<CalculadoraSalarioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalculadoraSalarioComponent]
    });
    fixture = TestBed.createComponent(CalculadoraSalarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
