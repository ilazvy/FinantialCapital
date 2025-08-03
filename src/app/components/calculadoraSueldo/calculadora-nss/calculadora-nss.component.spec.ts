import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculadoraNssComponent } from './calculadora-nss.component';

describe('CalculadoraNssComponent', () => {
  let component: CalculadoraNssComponent;
  let fixture: ComponentFixture<CalculadoraNssComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalculadoraNssComponent]
    });
    fixture = TestBed.createComponent(CalculadoraNssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
