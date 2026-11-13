import { HttpClient } from '@angular/common/http';
import { Injectable, Service } from '@angular/core';
import { Movimiento } from '../Models/movimiento';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })

export class MovimientoService {
    private apiUrl = 'http://localhost:8080/api/expenses';

constructor(private http:HttpClient){}
  registrar(movimiento: Movimiento): Observable<Movimiento> {
    return this.http.post<Movimiento>(  this.apiUrl, movimiento);
  }

  listar(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.apiUrl);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  actualizar(id: number, movimiento: Movimiento): Observable<Movimiento> {
return this.http.put<Movimiento>(`${this.apiUrl}/${id}`, movimiento );
  }
}
