import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelechargementPvComponent } from './telechargement-pv.component';

describe('TelechargementPvComponent', () => {
  let component: TelechargementPvComponent;
  let fixture: ComponentFixture<TelechargementPvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelechargementPvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TelechargementPvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
