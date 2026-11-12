import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

// Deja pasar solo a usuarios logueados con rol ADMIN.
// Es una ayuda para la interfaz: aunque alguien la saltee,
// el back responde 403 en /admin/** si no es admin.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.estaLogueado()) return router.createUrlTree(['/login']);
  if (!auth.esAdmin()) return router.createUrlTree(['/']);
  return true;
};
