import { HttpInterceptorFn } from '@angular/common/http';

const RUTAS_PUBLICAS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('accessToken');

  const esNuestraApi = req.url.startsWith('http://localhost:8080');
  const esPublica = RUTAS_PUBLICAS.some(ruta => req.url.includes(ruta));

  if (token && esNuestraApi && !esPublica) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};