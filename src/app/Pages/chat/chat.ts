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

  // Edición de un mensaje propio
  editandoId = signal<number | null>(null);
  textoEdicion = '';
  // Id del mensaje al que se le pide confirmación para borrar
  borrandoId = signal<number | null>(null);

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

  // ---------- Editar ----------
  empezarEdicion(m: Mensaje) {
    this.borrandoId.set(null);
    this.editandoId.set(m.id);
    this.textoEdicion = m.contenido;
  }

  cancelarEdicion() {
    this.editandoId.set(null);
    this.textoEdicion = '';
  }

  guardarEdicion(m: Mensaje) {
    const contenido = this.textoEdicion.trim();
    if (!contenido) return;
    this.chatService.editarMensaje(m.id, contenido).subscribe({
      next: (editado) => {
        this.mensajes.update((lista) => lista.map((x) => (x.id === editado.id ? editado : x)));
        this.cancelarEdicion();
      },
      error: () => this.error.set('No se pudo editar el mensaje'),
    });
  }

  // ---------- Borrar ----------
  pedirBorrar(m: Mensaje) {
    this.cancelarEdicion();
    this.borrandoId.set(m.id);
  }

  cancelarBorrar() {
    this.borrandoId.set(null);
  }

  borrar(m: Mensaje) {
    this.chatService.eliminarMensaje(m.id).subscribe({
      next: () => {
        this.mensajes.update((lista) => lista.filter((x) => x.id !== m.id));
        this.borrandoId.set(null);
      },
      error: () => {
        this.borrandoId.set(null);
        this.error.set('No se pudo borrar el mensaje');
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