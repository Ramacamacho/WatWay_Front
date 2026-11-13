import { Component, inject } from '@angular/core';
import { Movimiento } from '../../Models/movimiento';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule,CurrencyPipe],
  selector: 'app-sist-gastos',
  styleUrl: './sist-gastos.css',
  templateUrl: './sist-gastos.html',
})
export class SistGastos {
  private fb = inject(FormBuilder);

  formulario!: FormGroup;

  movimientos: Movimiento[] = [];

  cargando: boolean = false;
  error: string = '';

  ngOnInit(): void {

    this.formulario = this.fb.group({
      description: ['', Validators.required],
      cost: [null, [Validators.required, Validators.min(0),Validators.max(10000000)]],
      date: ['', Validators.required],
      category: ['OTROS', Validators.required],
      type: ['GASTO', Validators.required],
    });

   
  }
  registrar(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

   const movimiento: Movimiento = {
  ...this.formulario.value,
  id: Date.now().toString()
};

    this.movimientos = [...this.movimientos, movimiento];

    alert('Movimiento registrado correctamente');

    this.formulario.reset({
      description: '',
      cost: null,
      date: '',
      category: 'OTROS',
      type: 'GASTO',
    });

  }


  get ingresos(): number {

    return this.movimientos
      .filter(m => m.type === 'INGRESO')
      .reduce((total, m) => total + Number(m.cost), 0);

  }


  get gastos(): number {

    return this.movimientos
      .filter(m => m.type === 'GASTO')
      .reduce((total, m) => total + Number(m.cost), 0);

  }


  get balance(): number {

    return this.ingresos - this.gastos;

  }

  // ESCALA DEL GRÁFICO

  get maxComparacion(): number {

    return Math.max(this.ingresos, this.gastos, 1);

  }

  get porcentajeIngresos(): number {

    return (this.ingresos / this.maxComparacion) * 100;

  }

  get porcentajeGastos(): number {

    return (this.gastos / this.maxComparacion) * 100;

  }

  // GASTOS POR CATEGORÍA

  get gastosPorCategoria(): {
    categoria: string,
    monto: number,
    porcentaje: number
  }[] {

    const categorias = [
      'COMIDA',
      'TRANSPORTE',
      'CASA',
      'OTROS'
    ];

    return categorias
      .map(categoria => {

        const monto = this.movimientos
          .filter(m =>
            m.type === 'GASTO' &&
            m.category === categoria
          )
          .reduce((total, m) => total + Number(m.cost), 0);

        return {
          categoria,
          monto,
          porcentaje: this.gastos > 0
            ? (monto / this.gastos) * 100
            : 0
        };

      })
      .filter(c => c.monto > 0);

  }

}

