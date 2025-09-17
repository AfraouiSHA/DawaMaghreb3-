import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefProjetComponent } from './chef-projet.component';

describe('ChefProjetComponent', () => {
  let component: ChefProjetComponent;
  let fixture: ComponentFixture<ChefProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChefProjetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChefProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
