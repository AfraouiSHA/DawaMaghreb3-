import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestNgmodelComponent } from './test-ngmodel.component';

describe('TestNgmodelComponent', () => {
  let component: TestNgmodelComponent;
  let fixture: ComponentFixture<TestNgmodelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestNgmodelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestNgmodelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
