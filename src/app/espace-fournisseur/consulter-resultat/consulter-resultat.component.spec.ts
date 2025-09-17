import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsulterResultatComponent } from './consulter-resultat.component';

describe('ConsulterResultatComponent', () => {
  let component: ConsulterResultatComponent;
  let fixture: ComponentFixture<ConsulterResultatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsulterResultatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsulterResultatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
