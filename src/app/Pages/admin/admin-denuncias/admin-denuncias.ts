import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DenunciaService } from '../../../Servicios/denuncia-service';
import { Denuncia, EstadoDenuncia, MOTIVOS, TEXTO_ESTADO, TEXTO_TIPO } from '../../../Models/denuncia';

// Sección del panel de admin para moderar denuncias.
// Los botones que aparecen dependen del estado (State en el back):
//  Pendiente   -> Tomar en revisión / Descartar
//  En revisión -> Resolver (con medidas) / Descartar
//  Resuelta o Descartada -> solo lectura
@Component({
  selector: 'app-admin-denuncias',
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-denuncias.html',
  styleUrl: './admin-denuncias.css',
})
export class AdminDenuncias implements OnInit {
  private denunciaService = inject(DenunciaService);

  filtros: { valor: EstadoDenuncia | null; texto: string }[] = [
    { valor: 'PENDIENTE', texto: 'Pendientes' },
    { valor: 'EN_REVISION', texto: 'En revisión' },
    { valor: 'RESUELTA', texto: 'Resueltas' },
    { valor: 'DESCARTADA', texto: 'Descartadas' },
    { valor: null, texto: 'Todas' },
  ];
  textoTipo = TEXTO_TIPO;
  textoEstado = TEXTO_ESTADO;

  filtro = signal<EstadoDenuncia | null>('PENDIENTE');
  denuncias = signal<Denuncia[]>([]);
  pendientes = signal(0);
  cargando = signal(false);
  error = signal('');
  procesandoId = signal<number | null>(null);

  // Decisión que está armando el admin (una denuncia a la vez)
  decidiendoId = signal<number | null>(null);
  accion = signal<'resolver' | 'descartar'>('resolver');
  nota = '';
  borrarContenido = false;
  desactivarUsuario = false;

  ngOnInit() {
    this.cargar();
  }

  cambiarFiltro(valor: EstadoDenuncia | null) {
    this.filtro.set(valor);
    this.cerrarDecision();
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.denunciaService.listar(this.filtro()).subscribe({
      next: (lista) => {
        this.denuncias.set(lista);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(this.mensajeError(err, 'No se pudieron cargar las denuncias.'));
      },
    });
    this.denunciaService.pendientes().subscribe({
      next: (r) => this.pendientes.set(r.pendientes),
      error: () => {},
    });
  }

  motivoTexto(d: Denuncia) {
    return MOTIVOS.find((m) => m.valor === d.motivo)?.texto ?? d.motivo;
  }

  revisar(d: Denuncia) {
    this.error.set('');
    this.procesandoId.set(d.id);
    this.denunciaService.revisar(d.id).subscribe({
      next: () => this.listo(),
      error: (err: HttpErrorResponse) => this.fallo(err, 'No se pudo tomar la denuncia.'),
    });
  }

  abrirDecision(d: Denuncia, accion: 'resolver' | 'descartar') {
    this.decidiendoId.set(d.id);
    this.accion.set(accion);
    this.nota = '';
    this.borrarContenido = false;
    this.desactivarUsuario = false;
  }

  cerrarDecision() {
    this.decidiendoId.set(null);
  }

  confirmar(d: Denuncia) {
    this.error.set('');
    this.procesandoId.set(d.id);
    const peticion =
      this.accion() === 'resolver'
        ? this.denunciaService.resolver(d.id, {
            nota: this.nota.trim() || undefined,
            borrarContenido: this.borrarContenido,
            desactivarUsuario: this.desactivarUsuario,
          })
        : this.denunciaService.descartar(d.id, this.nota.trim());
    peticion.subscribe({
      next: () => this.listo(),
      error: (err: HttpErrorResponse) => this.fallo(err, 'No se pudo guardar la decisión.'),
    });
  }

  private listo() {
    this.procesandoId.set(null);
    this.cerrarDecision();
    this.cargar();
  }

  private fallo(err: HttpErrorResponse, porDefecto: string) {
    this.procesandoId.set(null);
    this.error.set(this.mensajeError(err, porDefecto));
    this.cargar();
  }

  private mensajeError(err: HttpErrorResponse, porDefecto: string) {
    if (err.status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
    if (err.status === 403) return 'No tenés permisos de administrador.';
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    // 400 (reglas) y 409 (estado que no corresponde) traen el motivo
    if ((err.status === 400 || err.status === 409) && err.error?.error) return err.error.error;
    return porDefecto;
  }
}
