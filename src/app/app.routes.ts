import { Routes } from '@angular/router';
import { Home } from './Pages/home/home';
import { AboutUs } from './Pages/about-us/about-us';
import { LoginForm } from './Pages/login-form/login-form';
import { CrearCuentaForm } from './Pages/crear-cuenta-form/crear-cuenta-form';
import { ChecklistForm } from './SecondPages/checklist-form/checklist-form';
import { Match } from './Pages/match/match';
import { authGuard } from './Servicios/auth-guard';
import { Chat } from './Pages/chat/chat';
import { SistGastos } from './SecondPages/sist-gastos/sist-gastos';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'sobrenosotros', component: AboutUs },
  { path: 'login', component: LoginForm },
  { path: 'crearcuenta', component: CrearCuentaForm },
  { path: 'checklist', component: ChecklistForm, canActivate: [authGuard] },
  { path: 'match', component: Match, canActivate: [authGuard] },
  { path: 'chat/:usuarioId', component: Chat, canActivate: [authGuard] },
  { path: 'finanzas', component: SistGastos, canActivate: [authGuard] },

  // El comodín SIEMPRE va último: atrapa cualquier URL que no coincida con las de arriba
  { path: '**', redirectTo: '' },
];