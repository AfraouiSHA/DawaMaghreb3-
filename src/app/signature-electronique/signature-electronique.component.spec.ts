import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureElectroniqueComponent } from './signature-electronique.component';

describe('SignatureElectroniqueComponent', () => {
  let component: SignatureElectroniqueComponent;
  let fixture: ComponentFixture<SignatureElectroniqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignatureElectroniqueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SignatureElectroniqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
