import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mensaje, EnviarMensaje } from '../Models/mensaje';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/chat';

  getConversacion(usuarioId: number): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.apiUrl}/conversacion/${usuarioId}`);
  }

  enviarMensaje(body: EnviarMensaje): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.apiUrl}/enviar`, body);
  }
}