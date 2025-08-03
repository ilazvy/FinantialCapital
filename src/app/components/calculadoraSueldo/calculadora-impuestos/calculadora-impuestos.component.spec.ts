import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculadoraImpuestosComponent } from './calculadora-impuestos.component';

describe('CalculadoraImpuestosComponent', () => {
  let component: CalculadoraImpuestosComponent;
  let fixture: ComponentFixture<CalculadoraImpuestosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalculadoraImpuestosComponent]
    });
    fixture = TestBed.createComponent(CalculadoraImpuestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
