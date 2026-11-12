import { Routes } from '@angular/router';
import { Home } from './Pages/home/home';
import { AboutUs } from './Pages/about-us/about-us';
import { LoginForm } from './Pages/login-form/login-form';
import { CrearCuentaForm } from './Pages/crear-cuenta-form/crear-cuenta-form';
import { ChecklistForm } from './SecondPages/checklist-form/checklist-form';
import { Match } from './Pages/match/match';
import { authGuard } from './Servicios/auth-guard';
import { Chat } from './Pages/chat/chat';
import { Perfilpage } from './SecondPages/perfilpage/perfilpage';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'sobrenosotros', component: AboutUs },
  { path: 'login', component: LoginForm },
  { path: 'crearcuenta', component: CrearCuentaForm },
  { path: 'checklist', component: ChecklistForm, canActivate: [authGuard] },
  { path: 'match', component: Match, canActivate: [authGuard] },
  { path: 'chat/:usuarioId', component: Chat, canActivate: [authGuard] },
  {path: 'perfil',component:Perfilpage,canActivate : [authGuard]},

  // El comodín SIEMPRE va último: atrapa cualquier URL que no coincida con las de arriba
  { path: '**', redirectTo: '' },
];