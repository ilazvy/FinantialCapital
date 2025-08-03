import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SueldosComponent } from './sueldos.component';

describe('SueldosComponent', () => {
  let component: SueldosComponent;
  let fixture: ComponentFixture<SueldosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SueldosComponent]
    });
    fixture = TestBed.createComponent(SueldosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
