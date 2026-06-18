import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInFetchService } from './check-in-fetch-service';

describe('CheckInFetchService', () => {
  let component: CheckInFetchService;
  let fixture: ComponentFixture<CheckInFetchService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInFetchService],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckInFetchService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
