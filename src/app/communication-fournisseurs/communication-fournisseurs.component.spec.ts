import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationFournisseursComponent } from './communication-fournisseurs.component';

describe('CommunicationFournisseursComponent', () => {
  let component: CommunicationFournisseursComponent;
  let fixture: ComponentFixture<CommunicationFournisseursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationFournisseursComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunicationFournisseursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
