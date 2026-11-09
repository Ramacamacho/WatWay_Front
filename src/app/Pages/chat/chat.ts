import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ChatService } from '../../Servicios/chat-service';
import { Mensaje } from '../../Models/mensaje';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);

  @ViewChild('lista') lista?: ElementRef<HTMLDivElement>;

  otroUsuarioId = 0;
  texto = '';

  mensajes = signal<Mensaje[]>([]);
  cargando = signal(true);
  enviando = signal(false);
  error = signal('');
  nombre = signal('Chat');

  private intervalo?: ReturnType<typeof setInterval>;

  ngOnInit() {
    // Nombre que manda la página de matches al tocar "Chatear"
    const estado = history.state as { nombre?: string };
    if (estado?.nombre) this.nombre.set(estado.nombre);

    this.otroUsuarioId = Number(this.route.snapshot.paramMap.get('usuarioId'));
    this.cargarMensajes();

    // Polling: cada 3 segundos busca mensajes nuevos
    this.intervalo = setInterval(() => this.cargarMensajes(), 3000);
  }

  ngOnDestroy() {
    // Al salir de la página deja de consultar al back
    clearInterval(this.intervalo);
  }

  cargarMensajes() {
    this.chatService.getConversacion(this.otroUsuarioId).subscribe({
      next: (lista) => {
        const hayNuevos = lista.length !== this.mensajes().length;
        this.mensajes.set(lista);
        this.cargando.set(false);
        this.error.set('');
        if (hayNuevos) this.bajarScroll();
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(
          err.status === 403
            ? 'Solo podés chatear con tus matches'
            : 'No se pudo cargar la conversación'
        );
      },
    });
  }

  enviar() {
    const contenido = this.texto.trim();
    if (!contenido || this.enviando()) return;

    this.enviando.set(true);
    this.chatService
      .enviarMensaje({ receptorId: this.otroUsuarioId, contenido })
      .subscribe({
        next: (mensaje) => {
          this.mensajes.update((lista) => [...lista, mensaje]);
          this.texto = '';
          this.enviando.set(false);
          this.bajarScroll();
        },
        error: () => {
          this.enviando.set(false);
          this.error.set('No se pudo enviar el mensaje');
        },
      });
  }

  // Si el emisor no es el otro usuario, el mensaje es mío
  esMio(m: Mensaje): boolean {
    return m.emisorId !== this.otroUsuarioId;
  }

  // Si hay mensajes, saca el nombre de ahí. Si no, usa el que mandó la página de matches.
  nombreOtro(): string {
    const m = this.mensajes()[0];
    if (m) {
      return m.emisorId === this.otroUsuarioId ? m.emisorNombre : m.receptorNombre;
    }
    return this.nombre();
  }

  private bajarScroll() {
    setTimeout(() => {
      const el = this.lista?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}