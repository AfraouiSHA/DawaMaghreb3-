import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemplirInformationComponent } from './remplir-information.component';

describe('RemplirInformationComponent', () => {
  let component: RemplirInformationComponent;
  let fixture: ComponentFixture<RemplirInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemplirInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemplirInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
