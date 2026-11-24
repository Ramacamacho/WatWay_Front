// Coincide con MensajeDTO.java
export interface Mensaje {
  id: number;
  emisorId: number;
  emisorNombre: string;
  receptorId: number;
  receptorNombre: string;
  contenido: string | null; // null si fue eliminado
  fechaEnvio: string;
  editado: boolean;
  fechaEdicion: string | null;
  leido: boolean;
  fechaLectura: string | null;
  eliminado: boolean;
  puedeModificar: boolean; // mío y todavía no leído
}

// Coincide con EnviarMensajeDTO.java
export interface EnviarMensaje {
  receptorId: number;
  contenido: string;
}

// Coincide con NoLeidosDTO.java
export interface NoLeidos {
  usuarioId: number;
  cantidad: number;
}
