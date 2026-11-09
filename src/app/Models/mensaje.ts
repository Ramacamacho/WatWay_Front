// Coincide con MensajeDTO.java
export interface Mensaje {
  id: number;
  emisorId: number;
  emisorNombre: string;
  receptorId: number;
  receptorNombre: string;
  contenido: string;
  fechaEnvio: string;
}

// Coincide con EnviarMensajeDTO.java
export interface EnviarMensaje {
  receptorId: number;
  contenido: string;
}