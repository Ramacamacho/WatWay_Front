import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminService } from '../../Servicios/admin-service';
import { Auth } from '../../Servicios/auth';
import { AdminUsuario } from '../../Models/admin-usuario';
import { ForoService } from '../../Servicios/foro-service';
import { EstadoForo } from '../../Models/foro';
import { AdminDenuncias } from './admin-denuncias/admin-denuncias';

@Component({
  selector: 'app-admin',
  imports: [AdminDenuncias],
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class Admin implements OnInit {
  private adminService = inject(AdminService);
  private auth = inject(Auth);
  private foroService = inject(ForoService);

  usuarios = signal<AdminUsuario[]>([]);
  cargando = signal(true);
  error = signal('');
  exito = signal('');

  // Id del usuario al que se le está pidiendo confirmación para desactivar
  confirmandoId = signal<number | null>(null);
  // Id de la fila que tiene una acción en curso (para deshabilitar sus botones)
  procesandoId = signal<number | null>(null);

  // ---------- Estados con empleadores (pintan el mapa del foro) ----------
  estados = signal<EstadoForo[]>([]);
  cambiandoCodigo = signal<string | null>(null);
  cantidadConEmpleadores = computed(() => this.estados().filter(e => e.tieneEmpleadores).length);

  ngOnInit() {
    this.cargar();
    this.cargarEstados();
  }

  cargarEstados() {
    this.foroService.getEstados().subscribe({
      next: lista => this.estados.set(lista),
      error: (err: HttpErrorResponse) =>
        this.error.set(this.mensajeError(err, 'No se pudieron cargar los estados.')),
    });
  }

  alternarEmpleadores(e: EstadoForo) {
    this.limpiarMensajes();
    this.cambiandoCodigo.set(e.codigo);
    this.foroService.marcarEmpleadores(e.codigo, !e.tieneEmpleadores).subscribe({
      next: actualizado => {
        this.cambiandoCodigo.set(null);
        this.estados.update(lista => lista.map(x => (x.codigo === actualizado.codigo ? actualizado : x)));
      },
      error: (err: HttpErrorResponse) => {
        this.cambiandoCodigo.set(null);
        this.error.set(this.mensajeError(err, 'No se pudo actualizar el estado.'));
      },
    });
  }

  cargar() {
    this.cargando.set(true);
    this.adminService.listarUsuarios().subscribe({
      next: lista => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(this.mensajeError(err, 'No se pudo cargar la lista de usuarios.'));
      },
    });
  }

  // El admin no puede desactivarse ni tocarse a sí mismo desde esta pantalla
  esYo(u: AdminUsuario) {
    return u.email.toLowerCase() === this.auth.email()?.toLowerCase();
  }

  esAdmin(u: AdminUsuario) {
    return u.roles.includes('ADMIN');
  }

  pedirConfirmacion(u: AdminUsuario) {
    this.limpiarMensajes();
    this.confirmandoId.set(u.usuarioId);
  }

  cancelar() {
    this.confirmandoId.set(null);
  }

  desactivar(u: AdminUsuario) {
    this.limpiarMensajes();
    this.procesandoId.set(u.usuarioId);

    this.adminService.desactivarUsuario(u.usuarioId).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.confirmandoId.set(null);
        this.exito.set(`${u.nombre} ${u.apellido} fue desactivado.`);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.procesandoId.set(null);
        this.confirmandoId.set(null);
        this.error.set(this.mensajeError(err, 'No se pudo desactivar el usuario.'));
      },
    });
  }

  reactivar(u: AdminUsuario) {
    this.limpiarMensajes();
    this.procesandoId.set(u.usuarioId);

    this.adminService.reactivarUsuario(u.usuarioId).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.exito.set(`${u.nombre} ${u.apellido} fue reactivado.`);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.procesandoId.set(null);
        this.error.set(this.mensajeError(err, 'No se pudo reactivar el usuario.'));
      },
    });
  }

  hacerAdmin(u: AdminUsuario) {
    if (u.credentialId === null) return;
    this.limpiarMensajes();
    this.procesandoId.set(u.usuarioId);

    this.adminService.hacerAdmin(u.credentialId).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.exito.set(`${u.nombre} ${u.apellido} ahora es admin. Tiene que volver a iniciar sesión para verlo.`);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.procesandoId.set(null);
        this.error.set(this.mensajeError(err, 'No se pudo asignar el rol.'));
      },
    });
  }

  quitarAdmin(u: AdminUsuario) {
    if (u.credentialId === null) return;
    this.limpiarMensajes();
    this.procesandoId.set(u.usuarioId);

    this.adminService.quitarAdmin(u.credentialId).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.exito.set(`${u.nombre} ${u.apellido} ya no es admin.`);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.procesandoId.set(null);
        this.error.set(this.mensajeError(err, 'No se pudo quitar el rol.'));
      },
    });
  }

  private limpiarMensajes() {
    this.error.set('');
    this.exito.set('');
  }

  private mensajeError(err: HttpErrorResponse, porDefecto: string) {
    if (err.status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
    if (err.status === 403) return 'No tenés permisos de administrador.';
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    // Errores de reglas de negocio (400): el back manda el motivo en { error: "..." }
    if (err.status === 400 && err.error?.error) return err.error.error;
    return porDefecto;
  }
}
