import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelechargerDocumentComponent } from './telecharger-document.component';

describe('TelechargerDocumentComponent', () => {
  let component: TelechargerDocumentComponent;
  let fixture: ComponentFixture<TelechargerDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelechargerDocumentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TelechargerDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
