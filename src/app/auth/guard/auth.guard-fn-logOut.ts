import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuardFnlogOut = () => {
  const route = inject(Router);

  if (!localStorage.getItem('token')) {
    return true;
  } else {
    route.navigateByUrl('');
    return false;
  }
};
