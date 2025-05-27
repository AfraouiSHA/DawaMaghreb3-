import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoumissionComponent } from './soumission.component';

describe('SoumissionComponent', () => {
  let component: SoumissionComponent;
  let fixture: ComponentFixture<SoumissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoumissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoumissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
