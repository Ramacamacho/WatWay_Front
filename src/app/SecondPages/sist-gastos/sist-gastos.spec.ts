import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SistGastos } from './sist-gastos';

describe('SistGastos', () => {
  let component: SistGastos;
  let fixture: ComponentFixture<SistGastos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SistGastos],
    }).compileComponents();

    fixture = TestBed.createComponent(SistGastos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
