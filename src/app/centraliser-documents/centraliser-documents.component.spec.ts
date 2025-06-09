import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentraliserDocumentsComponent } from './centraliser-documents.component';

describe('CentraliserDocumentsComponent', () => {
  let component: CentraliserDocumentsComponent;
  let fixture: ComponentFixture<CentraliserDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentraliserDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentraliserDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
