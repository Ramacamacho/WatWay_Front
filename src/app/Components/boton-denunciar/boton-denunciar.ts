import { Component, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DenunciaService } from '../../Servicios/denuncia-service';
import { MOTIVOS, MotivoDenuncia, TipoDenuncia } from '../../Models/denuncia';

// Botón "🚩 Denunciar" reutilizable: se usa en el chat, el foro y match.
// Al tocarlo despliega un mini formulario con el motivo.
@Component({
  selector: 'app-boton-denunciar',
  imports: [FormsModule],
  templateUrl: './boton-denunciar.html',
  styleUrl: './boton-denunciar.css',
})
export class BotonDenunciar {
  private denunciaService = inject(DenunciaService);

  // Qué se denuncia y su id (mensaje, tema, respuesta o usuario)
  tipo = input.required<TipoDenuncia>();
  referenciaId = input.required<number>();
  etiqueta = input('Denunciar');
  // Avisa a la pantalla que la denuncia se envió (por ejemplo, para ocultar el perfil)
  denunciado = output<void>();

  motivos = MOTIVOS;
  abierto = signal(false);
  enviando = signal(false);
  enviado = signal(false);
  error = signal('');
  motivo: MotivoDenuncia | '' = '';
  descripcion = '';

  abrir() {
    this.abierto.set(true);
    this.error.set('');
  }

  cancelar() {
    this.abierto.set(false);
    this.motivo = '';
    this.descripcion = '';
    this.error.set('');
  }

  enviar() {
    if (!this.motivo || this.enviando()) return;
    this.enviando.set(true);
    this.error.set('');
    this.denunciaService
      .denunciar({
        tipo: this.tipo(),
        referenciaId: this.referenciaId(),
        motivo: this.motivo,
        descripcion: this.descripcion.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.abierto.set(false);
          this.enviado.set(true);
          this.denunciado.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.enviando.set(false);
          this.error.set(err.error?.error ?? 'No se pudo enviar la denuncia');
        },
      });
  }
}
