// Mismo formato que AdminUsuarioDTO del back
export interface AdminUsuario {
  usuarioId: number;
  credentialId: number | null;
  nombre: string;
  apellido: string;
  email: string;
  posicionLaboral: string;
  ciudadDestino: string;
  activo: boolean;
  roles: string[];
}
