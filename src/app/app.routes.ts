import { Routes } from '@angular/router';
import { Home } from './Pages/home/home';
import { Contacto } from './Pages/contacto/contacto';
import { AboutUs } from './Pages/about-us/about-us';
import { LoginForm } from './Pages/login-form/login-form';
import { CrearCuentaForm } from './Pages/crear-cuenta-form/crear-cuenta-form';
import { ChecklistForm } from './SecondPages/checklist-form/checklist-form';
import { Match } from './Pages/match/match';
import { authGuard } from './Servicios/auth-guard';
import { Chat } from './Pages/chat/chat';
import { Admin } from './Pages/admin/admin';
import { adminGuard } from './Servicios/admin-guard';
import { Perfilpage } from './Pages/perfilpage/perfilpage';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'contact', component: Contacto },
  { path: 'sobrenosotros', component: AboutUs },
  { path: 'login', component: LoginForm },
  { path: 'crearcuenta', component: CrearCuentaForm },
  { path: 'checklist', component: ChecklistForm, canActivate: [authGuard] },
  { path: 'match', component: Match, canActivate: [authGuard] },
  { path: 'chat/:usuarioId', component: Chat, canActivate: [authGuard] },
  { path: 'admin', component: Admin, canActivate: [adminGuard] },
  { path: 'perfil', component: Perfilpage, canActivate: [authGuard] },

  // El comodín SIEMPRE va último: atrapa cualquier URL que no coincida con las de arriba
  { path: '**', redirectTo: '' },
];