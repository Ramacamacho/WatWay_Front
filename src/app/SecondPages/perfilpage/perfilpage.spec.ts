import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Perfilpage } from './perfilpage';

describe('Perfilpage', () => {
  let component: Perfilpage;
  let fixture: ComponentFixture<Perfilpage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Perfilpage],
    }).compileComponents();

    fixture = TestBed.createComponent(Perfilpage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
