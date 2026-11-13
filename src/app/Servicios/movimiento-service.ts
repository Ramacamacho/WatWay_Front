import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Movimiento } from '../Models/movimiento';

// CRUD de movimientos (gastos e ingresos) -> /api/expenses
// El token lo agrega solo el authInterceptor
@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/expenses';

  // GET /api/expenses
  listar() {
    return this.http.get<Movimiento[]>(this.apiUrl);
  }

  // POST /api/expenses
  registrar(movimiento: Movimiento) {
    return this.http.post<Movimiento>(this.apiUrl, movimiento);
  }

  // PUT /api/expenses/{id}
  actualizar(id: number, movimiento: Movimiento) {
    return this.http.put<Movimiento>(`${this.apiUrl}/${id}`, movimiento);
  }

  // DELETE /api/expenses/{id}
  eliminar(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
