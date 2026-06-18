import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsDirection } from './gps-direction';

describe('GpsDirection', () => {
  let component: GpsDirection;
  let fixture: ComponentFixture<GpsDirection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GpsDirection],
    }).compileComponents();

    fixture = TestBed.createComponent(GpsDirection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
