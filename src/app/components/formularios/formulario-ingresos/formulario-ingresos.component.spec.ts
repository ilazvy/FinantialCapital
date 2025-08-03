import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioIngresosComponent } from './formulario-ingresos.component';

describe('FormularioIngresosComponent', () => {
  let component: FormularioIngresosComponent;
  let fixture: ComponentFixture<FormularioIngresosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormularioIngresosComponent]
    });
    fixture = TestBed.createComponent(FormularioIngresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
