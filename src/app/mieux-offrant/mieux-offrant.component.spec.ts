import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MieuxOffrantComponent } from './mieux-offrant.component';

describe('MieuxOffrantComponent', () => {
  let component: MieuxOffrantComponent;
  let fixture: ComponentFixture<MieuxOffrantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MieuxOffrantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MieuxOffrantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
  it('should render title in h1 tag', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Bienvenue dans l’espace Mieux Offrant');
  });
});
