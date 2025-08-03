import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioFiniquitoComponent } from './formulario-finiquito.component';

describe('FormularioFiniquitoComponent', () => {
  let component: FormularioFiniquitoComponent;
  let fixture: ComponentFixture<FormularioFiniquitoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormularioFiniquitoComponent]
    });
    fixture = TestBed.createComponent(FormularioFiniquitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
