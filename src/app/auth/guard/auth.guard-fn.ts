import { inject } from "@angular/core";
import { UserSessionService } from "../services/user-session.service";
import { Router } from "@angular/router";

export const authGuardFn = () =>{

    const authService = inject(UserSessionService);
    const route = inject(Router);


    if(authService.getLogIn() || localStorage.getItem('token')){
        localStorage.setItem('token','123-456-789');
        return true;
    }else{
        route.navigateByUrl('access-denied')
        return false;
    }

}
