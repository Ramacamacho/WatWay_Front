export interface Movimiento {
     id? :string,
    description:string,
    cost:number,
    date:string,
    category:string,
    type: 'INGRESO'|'GASTO',
}
