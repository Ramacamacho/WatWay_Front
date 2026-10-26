export interface Checklist {
   id?: number,
  trabajoId: number,
  usuarioId: number ,

}
export type NuevoChecklist = Omit<Checklist, 'id'>;