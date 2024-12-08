import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuardFnlogOut = () => {
  const route = inject(Router);

  if (!localStorage.getItem('token')) {
    return true;
  } else {
    route.navigateByUrl('');
    return false;
  }
};
