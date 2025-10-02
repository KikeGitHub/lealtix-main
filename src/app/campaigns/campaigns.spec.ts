import { TestBed } from '@angular/core/testing';
import { Campaigns } from './campaigns';

describe('Campaigns', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Campaigns],
    }).compileComponents();
  });

  it('should create the campaigns component', () => {
    const fixture = TestBed.createComponent(Campaigns);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render campaigns page title', () => {
    const fixture = TestBed.createComponent(Campaigns);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gestión de Campañas de Promociones');
  });
});
