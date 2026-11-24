import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  EstadoForo, MapaUsa, NuevoTema, Respuesta, TemaDetalle, TemaResumen,
} from '../Models/foro';

@Injectable({ providedIn: 'root' })
export class ForoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/foro';

  // Dibujo del mapa (archivo estático de /public, no pasa por el back)
  getMapa(): Observable<MapaUsa> {
    return this.http.get<MapaUsa>('/data/estados-usa.json');
  }

  // ---------- Estados ----------
  getEstados(): Observable<EstadoForo[]> {
    return this.http.get<EstadoForo[]>(`${this.apiUrl}/estados`);
  }

  getTemasDeEstado(codigo: string): Observable<TemaResumen[]> {
    return this.http.get<TemaResumen[]>(`${this.apiUrl}/estados/${codigo}/temas`);
  }

  crearTemaEnEstado(codigo: string, tema: NuevoTema): Observable<TemaDetalle> {
    return this.http.post<TemaDetalle>(`${this.apiUrl}/estados/${codigo}/temas`, tema);
  }

  // ---------- Foro global ----------
  getTemasGlobales(): Observable<TemaResumen[]> {
    return this.http.get<TemaResumen[]>(`${this.apiUrl}/global/temas`);
  }

  crearTemaGlobal(tema: NuevoTema): Observable<TemaDetalle> {
    return this.http.post<TemaDetalle>(`${this.apiUrl}/global/temas`, tema);
  }

  // Solo ADMIN
  crearFaq(tema: NuevoTema): Observable<TemaDetalle> {
    return this.http.post<TemaDetalle>(`${this.apiUrl}/global/faq`, tema);
  }

  // ---------- Un tema (CRUD) ----------
  getTema(id: number): Observable<TemaDetalle> {
    return this.http.get<TemaDetalle>(`${this.apiUrl}/temas/${id}`);
  }

  editarTema(id: number, tema: NuevoTema): Observable<TemaDetalle> {
    return this.http.put<TemaDetalle>(`${this.apiUrl}/temas/${id}`, tema);
  }

  eliminarTema(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/temas/${id}`);
  }

  // ---------- Respuestas (CRUD) ----------
  responder(temaId: number, contenido: string): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.apiUrl}/temas/${temaId}/respuestas`, { contenido });
  }

  editarRespuesta(id: number, contenido: string): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.apiUrl}/respuestas/${id}`, { contenido });
  }

  eliminarRespuesta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/respuestas/${id}`);
  }

  // ---------- Admin ----------
  marcarEmpleadores(codigo: string, tieneEmpleadores: boolean): Observable<EstadoForo> {
    return this.http.put<EstadoForo>(
      `http://localhost:8080/admin/estados/${codigo}/empleadores`,
      { tieneEmpleadores },
    );
  }
}
