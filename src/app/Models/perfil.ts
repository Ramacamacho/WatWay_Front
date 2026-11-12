// Coincide con UsuarioResponseDTO.java
export interface Perfil {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  posicionLaboral: string;
  ciudadDestino: string;
  sexo: string;
  descripcion: string | null;
}

// Coincide con ActualizarUsuarioDTO.java
export interface ActualizarPerfil {
  nombre: string;
  apellido: string;
  posicionLaboral: string;
  ciudadDestino: string;
  sexo: string;
  descripcion: string;
}
