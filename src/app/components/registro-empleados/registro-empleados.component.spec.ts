import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroEmpleadosComponent } from './registro-empleados.component';

describe('RegistroEmpleadosComponent', () => {
  let component: RegistroEmpleadosComponent;
  let fixture: ComponentFixture<RegistroEmpleadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistroEmpleadosComponent]
    });
    fixture = TestBed.createComponent(RegistroEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
