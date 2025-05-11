import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaitreOuvrageComponent } from './maitre-ouvrage.component';

describe('MaitreOuvrageComponent', () => {
  let component: MaitreOuvrageComponent;
  let fixture: ComponentFixture<MaitreOuvrageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaitreOuvrageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaitreOuvrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
