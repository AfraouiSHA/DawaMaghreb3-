import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoAoComponent } from './info-ao.component';

describe('InfoAoComponent', () => {
  let component: InfoAoComponent;
  let fixture: ComponentFixture<InfoAoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoAoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoAoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
