import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ChatService } from '../../Servicios/chat-service';
import { BotonDenunciar } from '../../Components/boton-denunciar/boton-denunciar';
import { MatchService } from '../../Servicios/match-service';
import { Mensaje } from '../../Models/mensaje';
import { UsuarioMatch } from '../../Models/usuario-match';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe, RouterLink, BotonDenunciar],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private matchService = inject(MatchService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('lista') lista?: ElementRef<HTMLDivElement>;

  // Con quién estoy chateando (sale de la URL /chat/:usuarioId)
  otroUsuarioId = signal(0);
  texto = '';

  mensajes = signal<Mensaje[]>([]);
  cargando = signal(true);
  enviando = signal(false);
  error = signal('');
  nombre = signal('Chat');

  // Columna izquierda: mis matches y cuántos mensajes sin leer tengo de cada uno
  matches = signal<UsuarioMatch[]>([]);
  cargandoMatches = signal(true);
  noLeidos = signal<Record<number, number>>({});

  // Edición de un mensaje propio
  editandoId = signal<number | null>(null);
  textoEdicion = '';
  // Id del mensaje al que se le pide confirmación para borrar
  borrandoId = signal<number | null>(null);

  private intervalo?: ReturnType<typeof setInterval>;
  // Mientras se muestra un aviso, el polling no lo borra
  private avisoActivo = false;
  private timerAviso?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    // Nombre que manda la página de matches al tocar "Chatear"
    const estado = history.state as { nombre?: string };
    if (estado?.nombre) this.nombre.set(estado.nombre);

    this.cargarMatches();

    // Al tocar otro match de la izquierda cambia la URL pero Angular reutiliza
    // este mismo componente: por eso se escucha paramMap y no se usa snapshot.
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.abrirChat(Number(params.get('usuarioId')));
    });

    // Polling: cada 3 segundos busca mensajes nuevos y actualiza los contadores
    this.intervalo = setInterval(() => this.cargarMensajes(), 3000);
  }

  ngOnDestroy() {
    // Al salir de la página deja de consultar al back
    clearInterval(this.intervalo);
    clearTimeout(this.timerAviso);
  }

  // ---------- Columna izquierda ----------

  cargarMatches() {
    this.matchService.getMatches().subscribe({
      next: (lista) => {
        this.matches.set(lista);
        this.cargandoMatches.set(false);
      },
      error: () => this.cargandoMatches.set(false),
    });
  }

  cargarNoLeidos() {
    this.chatService.getNoLeidos().subscribe({
      next: (lista) => {
        const mapa: Record<number, number> = {};
        lista.forEach((n) => (mapa[n.usuarioId] = n.cantidad));
        this.noLeidos.set(mapa);
      },
      // Si falla, la lista se muestra igual, sin los números
      error: () => {},
    });
  }

  // Cambia de conversación: limpia la anterior y carga la nueva
  private abrirChat(usuarioId: number) {
    if (usuarioId === this.otroUsuarioId()) return;
    this.otroUsuarioId.set(usuarioId);
    this.mensajes.set([]);
    this.cargando.set(true);
    this.texto = '';
    this.cancelarEdicion();
    this.borrandoId.set(null);
    this.error.set('');
    this.cargarMensajes();
  }

  // ---------- Conversación ----------

  cargarMensajes() {
    const id = this.otroUsuarioId();
    if (!id) return;
    this.chatService.getConversacion(id).subscribe({
      next: (lista) => {
        // Si mientras viajaba la respuesta el usuario cambió de chat, se descarta
        if (id !== this.otroUsuarioId()) return;
        const hayNuevos = lista.length !== this.mensajes().length;
        this.mensajes.set(lista);
        // Si mientras lo editaba el otro lo leyó, se cierra la edición
        const editando = lista.find((x) => x.id === this.editandoId());
        if (editando && !editando.puedeModificar) {
          this.cancelarEdicion();
          this.mostrarAviso('El mensaje ya fue leído: no se puede editar');
        }
        this.cargando.set(false);
        // No pisa un aviso de editar/borrar que todavía se está mostrando
        if (!this.avisoActivo) this.error.set('');
        if (hayNuevos) this.bajarScroll();
        // Al abrir el chat el back marca como leídos sus mensajes:
        // se actualizan los contadores de la izquierda
        this.cargarNoLeidos();
      },
      error: (err: HttpErrorResponse) => {
        if (id !== this.otroUsuarioId()) return;
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
      .enviarMensaje({ receptorId: this.otroUsuarioId(), contenido })
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
    if (!m.puedeModificar) return;
    this.borrandoId.set(null);
    this.editandoId.set(m.id);
    this.textoEdicion = m.contenido ?? '';
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
      error: (err: HttpErrorResponse) => {
        this.cancelarEdicion();
        this.mostrarAviso(this.mensajeError(err, 'No se pudo editar el mensaje'));
        this.cargarMensajes();
      },
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
      // No desaparece: queda como "Mensaje eliminado"
      next: () => {
        this.mensajes.update((lista) =>
          lista.map((x) =>
            x.id === m.id ? { ...x, eliminado: true, contenido: null, puedeModificar: false } : x
          )
        );
        this.borrandoId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.borrandoId.set(null);
        this.mostrarAviso(this.mensajeError(err, 'No se pudo borrar el mensaje'));
        this.cargarMensajes();
      },
    });
  }

  // Si el emisor no es el otro usuario, el mensaje es mío
  esMio(m: Mensaje): boolean {
    return m.emisorId !== this.otroUsuarioId();
  }

  // Nombre del otro: primero de la lista de matches, después de los mensajes,
  // y si no hay nada, el que mandó la página de matches.
  nombreOtro(): string {
    const match = this.matches().find((x) => x.id === this.otroUsuarioId());
    if (match) return `${match.nombre} ${match.apellido}`;
    const m = this.mensajes()[0];
    if (m) {
      return m.emisorId === this.otroUsuarioId() ? m.emisorNombre : m.receptorNombre;
    }
    return this.nombre();
  }

  // Muestra un aviso durante 4 segundos
  private mostrarAviso(texto: string) {
    this.error.set(texto);
    this.avisoActivo = true;
    clearTimeout(this.timerAviso);
    this.timerAviso = setTimeout(() => {
      this.avisoActivo = false;
      this.error.set('');
    }, 4000);
  }

  // El back manda { error: "..." } (por ejemplo "No podés editar un mensaje que ya fue leído")
  private mensajeError(err: HttpErrorResponse, porDefecto: string): string {
    return err.status === 403 && err.error?.error ? err.error.error : porDefecto;
  }

  private bajarScroll() {
    setTimeout(() => {
      const el = this.lista?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
