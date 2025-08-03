import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioGastosComponent } from './formulario-gastos.component';

describe('FormularioGastosComponent', () => {
  let component: FormularioGastosComponent;
  let fixture: ComponentFixture<FormularioGastosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormularioGastosComponent]
    });
    fixture = TestBed.createComponent(FormularioGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
