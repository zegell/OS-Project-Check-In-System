import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthRole } from './auth-role';

describe('AuthRole', () => {
  let component: AuthRole;
  let fixture: ComponentFixture<AuthRole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthRole],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthRole);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
