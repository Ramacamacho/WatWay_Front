import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Inicio2 } from './inicio2';

describe('Inicio2', () => {
  let component: Inicio2;
  let fixture: ComponentFixture<Inicio2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inicio2],
    }).compileComponents();

    fixture = TestBed.createComponent(Inicio2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
