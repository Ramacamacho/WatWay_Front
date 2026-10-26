import { Documento } from "./documento";


export interface ChecklistItem {
    id: number;
  documento: Documento;
  completado: boolean;
  fechaLimite: string | null;
}
