import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Movimiento, TipoMovimiento } from '../../Models/movimiento';
import { MovimientoService } from '../../Servicios/movimiento-service';

interface Categoria {
  valor: string;
  texto: string;
}

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe],
  selector: 'app-sist-gastos',
  styleUrl: './sist-gastos.css',
  templateUrl: './sist-gastos.html',
})
export class SistGastos implements OnInit {
  private fb = inject(FormBuilder);
  private movimientoService = inject(MovimientoService);

  // Cada tipo de movimiento tiene sus propias categorías
  readonly categoriasGasto: Categoria[] = [
    { valor: 'COMIDA', texto: 'Comida' },
    { valor: 'TRANSPORTE', texto: 'Transporte' },
    { valor: 'CASA', texto: 'Alojamiento' },
    { valor: 'OTROS', texto: 'Otros' },
  ];
  readonly categoriasIngreso: Categoria[] = [
    { valor: 'SALARIO', texto: 'Salario' },
    { valor: 'PROPINAS', texto: 'Propinas' },
    { valor: 'OTROS', texto: 'Otros' },
  ];

  formulario = this.fb.nonNullable.group({
    type: ['GASTO' as TipoMovimiento, Validators.required],
    description: ['', Validators.required],
    cost: [null as number | null, [Validators.required, Validators.min(0), Validators.max(10000000)]],
    date: ['', Validators.required],
    category: ['OTROS', Validators.required],
  });

  movimientos = signal<Movimiento[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  error = signal('');
  mensaje = signal('');
  editandoId = signal<number | null>(null);
  confirmandoId = signal<number | null>(null);
  tipo = signal<TipoMovimiento>('GASTO');

  categorias = computed(() => (this.tipo() === 'GASTO' ? this.categoriasGasto : this.categoriasIngreso));

  ngOnInit(): void {
    this.cargar();
  }

  // READ: trae los movimientos del usuario desde el back
  cargar(): void {
    this.cargando.set(true);
    this.movimientoService.listar().subscribe({
      next: (lista) => {
        this.movimientos.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus movimientos');
        this.cargando.set(false);
      },
    });
  }

  // CREATE o UPDATE, según si estamos editando
  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    const movimiento: Movimiento = { ...datos, cost: Number(datos.cost) };
    const id = this.editandoId();
    const peticion = id === null
      ? this.movimientoService.registrar(movimiento)
      : this.movimientoService.actualizar(id, movimiento);

    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensaje.set(id === null ? 'Movimiento registrado correctamente' : 'Movimiento actualizado');
        this.limpiarFormulario();
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(err.error?.error || 'No se pudo guardar el movimiento');
      },
    });
  }

  // Pasa un movimiento al formulario para editarlo
  editar(m: Movimiento): void {
    this.editandoId.set(m.id ?? null);
    this.confirmandoId.set(null);
    this.tipo.set(m.type);
    this.formulario.setValue({
      type: m.type,
      description: m.description,
      cost: m.cost,
      date: m.date,
      category: m.category,
    });
    this.mensaje.set('');
    document.querySelector('.formulario')?.scrollIntoView({ behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
  }

  // DELETE (con confirmación)
  pedirConfirmacion(id: number | undefined): void {
    this.confirmandoId.set(id ?? null);
  }

  cancelarEliminar(): void {
    this.confirmandoId.set(null);
  }

  eliminar(m: Movimiento): void {
    if (m.id === undefined) return;
    this.movimientoService.eliminar(m.id).subscribe({
      next: () => {
        this.movimientos.update((lista) => lista.filter((x) => x.id !== m.id));
        this.confirmandoId.set(null);
        if (this.editandoId() === m.id) this.limpiarFormulario();
      },
      error: () => this.error.set('No se pudo eliminar el movimiento'),
    });
  }

  // Al cambiar de gasto a ingreso (o al revés) la categoría vuelve a "Otros"
  cambiarTipo(): void {
    this.tipo.set(this.formulario.controls.type.value);
    this.formulario.controls.category.setValue('OTROS');
  }

  private limpiarFormulario(): void {
    this.editandoId.set(null);
    this.tipo.set('GASTO');
    this.formulario.reset({
      type: 'GASTO',
      description: '',
      cost: null,
      date: '',
      category: 'OTROS',
    });
  }

  // "2026-11-12" -> "12/11/2026"
  fecha(valor: string): string {
    return valor ? valor.split('-').reverse().join('/') : '';
  }

  textoCategoria(valor: string): string {
    return [...this.categoriasGasto, ...this.categoriasIngreso].find((c) => c.valor === valor)?.texto ?? valor;
  }

  // ===== Totales y gráficos =====

  ingresos = computed(() =>
    this.movimientos()
      .filter((m) => m.type === 'INGRESO')
      .reduce((total, m) => total + Number(m.cost), 0)
  );

  gastos = computed(() =>
    this.movimientos()
      .filter((m) => m.type === 'GASTO')
      .reduce((total, m) => total + Number(m.cost), 0)
  );

  balance = computed(() => this.ingresos() - this.gastos());

  private maxComparacion = computed(() => Math.max(this.ingresos(), this.gastos(), 1));
  porcentajeIngresos = computed(() => (this.ingresos() / this.maxComparacion()) * 100);
  porcentajeGastos = computed(() => (this.gastos() / this.maxComparacion()) * 100);

  gastosPorCategoria = computed(() =>
    this.categoriasGasto
      .map((c) => {
        const monto = this.movimientos()
          .filter((m) => m.type === 'GASTO' && m.category === c.valor)
          .reduce((total, m) => total + Number(m.cost), 0);
        return {
          categoria: c.texto,
          monto,
          porcentaje: this.gastos() > 0 ? (monto / this.gastos()) * 100 : 0,
        };
      })
      .filter((c) => c.monto > 0)
  );
}
