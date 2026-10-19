import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearCuentaForm } from './crear-cuenta-form';

describe('CrearCuentaForm', () => {
  let component: CrearCuentaForm;
  let fixture: ComponentFixture<CrearCuentaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCuentaForm]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CrearCuentaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
