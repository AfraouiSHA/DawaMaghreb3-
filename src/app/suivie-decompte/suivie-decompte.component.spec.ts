import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuivieDecompteComponent } from './suivie-decompte.component';

describe('SuivieDecompteComponent', () => {
  let component: SuivieDecompteComponent;
  let fixture: ComponentFixture<SuivieDecompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuivieDecompteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuivieDecompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
