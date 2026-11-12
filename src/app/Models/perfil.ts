export interface Perfil {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  posicionLaboral: string;
  ciudadDestino: string;
  sexo: string;
  descripcion: string;
}
export type PerfilUpdate = Omit<Perfil, 'id' | 'email'>;