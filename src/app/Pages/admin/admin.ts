import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminService } from '../../Servicios/admin-service';
import { Auth } from '../../Servicios/auth';
import { AdminUsuario } from '../../Models/admin-usuario';

@Component({
  selector: 'app-admin',
  imports: [],
  styleUrl: './admin.css',
  templateUrl: './admin.html',
})
export class Admin implements OnInit {
  private adminService = inject(AdminService);
  private auth = inject(Auth);

  usuarios = signal<AdminUsuario[]>([]);
  cargando = signal(true);
  error = signal('');
  exito = signal('');

  // Id del usuario al que se le está pidiendo confirmación para desactivar
  confirmandoId = signal<number | null>(null);
  // Id de la fila que tiene una acción en curso (para deshabilitar sus botones)
  procesandoId = signal<number | null>(null);

  ngOnInit() {
    this.cargar();
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

  private limpiarMensajes() {
    this.error.set('');
    this.exito.set('');
  }

  private mensajeError(err: HttpErrorResponse, porDefecto: string) {
    if (err.status === 401) return 'Tu sesión venció. Volvé a iniciar sesión.';
    if (err.status === 403) return 'No tenés permisos de administrador.';
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    return porDefecto;
  }
}
