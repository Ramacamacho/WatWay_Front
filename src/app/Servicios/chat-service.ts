import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mensaje, EnviarMensaje, NoLeidos } from '../Models/mensaje';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/chat';

  // Además de traer los mensajes, el back marca como leídos los que me mandaron
  getConversacion(usuarioId: number): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.apiUrl}/conversacion/${usuarioId}`);
  }

  enviarMensaje(body: EnviarMensaje): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.apiUrl}/enviar`, body);
  }

  // GET /chat/no-leidos -> cuántos mensajes sin leer tengo de cada match
  getNoLeidos(): Observable<NoLeidos[]> {
    return this.http.get<NoLeidos[]>(`${this.apiUrl}/no-leidos`);
  }

  // PUT /chat/mensajes/{id} -> editar un mensaje propio que todavía no se leyó
  editarMensaje(mensajeId: number, contenido: string): Observable<Mensaje> {
    return this.http.put<Mensaje>(`${this.apiUrl}/mensajes/${mensajeId}`, { contenido });
  }

  // DELETE /chat/mensajes/{id} -> borrar un mensaje propio que todavía no se leyó
  eliminarMensaje(mensajeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mensajes/${mensajeId}`);
  }
}
