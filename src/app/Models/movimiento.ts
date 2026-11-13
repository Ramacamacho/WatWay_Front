export type TipoMovimiento = 'INGRESO' | 'GASTO';

// Mismos campos que MovimientoDTO del back
export interface Movimiento {
  id?: number;
  description: string;
  cost: number;
  date: string; // "2026-11-12"
  category: string;
  type: TipoMovimiento;
}
