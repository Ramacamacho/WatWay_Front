import { Routes } from '@angular/router';
import { Home } from './Pages/home/home';
import { Contacto } from './Pages/contacto/contacto';
import { AboutUs } from './Pages/about-us/about-us';
import { LoginForm } from './Pages/login-form/login-form';
import { CrearCuentaForm } from './Pages/crear-cuenta-form/crear-cuenta-form';
import { Match } from './Pages/match/match';
import { authGuard } from './Servicios/auth-guard';

export const routes: Routes = [
    {path :'',component:Home},
    {path :'contact',component:Contacto},
     {path :'sobrenosotros',component:AboutUs},
     {path :'login',component:LoginForm},
     {path :'crearcuenta',component:CrearCuentaForm},
     { path: 'match', component: Match, canActivate: [authGuard] },
];
