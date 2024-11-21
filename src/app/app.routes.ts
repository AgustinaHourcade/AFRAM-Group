import { TransactionsPageComponent } from './transactions/pages/transactions-page/transactions-page.component';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthPageComponent } from './auth/pages/auth-page/auth-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AccountsComponent } from './accounts/pages/accounts/accounts.component';
import { ProfileComponent } from './users/pages/profile/profile.component';
import { AccountInfoComponent } from './accounts/pages/account-info/account-info.component';
import { UpdateProfileComponent } from './users/components/update-profile/update-profile.component';
import { MyTransactionsComponent } from './transactions/pages/my-transactions/my-transactions.component';
import { NewFixedtermComponent } from './fixedTerms/components/fixedterm/fixedterm.component';
import { CardComponent } from './cards/components/card/card.component';
import { NewcardComponent } from './cards/components/newcard/newcard.component';
import { NewAccountComponent } from './accounts/components/new-account/new-account.component';
import { UpdatePasswordComponent } from './users/components/update-password/update-password.component';
import { NgModule } from '@angular/core';
import { LegalComponent } from './pages/legal/legal.component';
import { FixedTermsComponent } from './fixedTerms/pages/fixed-terms/fixed-terms.component';
import { NewLoanComponent } from './loans/components/new-loan/new-loan.component';
import { ListLoanComponent } from './loans/components/list-loan/list-loan.component';
import { PayLoanComponent } from './loans/components/pay-loan/pay-loan.component';
import { RecoverPasswordComponent } from './users/components/recover-password/recover-password.component';
import { NewPasswordComponent } from './users/components/new-password/new-password.component';
import { authGuardFn } from './auth/guard/auth.guard-fn';
import { AccessDeniedComponent } from './auth/pages/access-denied/access-denied.component';
import { authGuardFnlogOut } from './auth/guard/auth.guard-fn-logOut';


export const routes: Routes = [
    {path: '', component: HomeComponent, title: 'Bienvenido | AFRAM Group'},
    {path: 'auth',component: AuthPageComponent, title: 'Inicio sesión | AFRAM Group'},
    {path: 'main', component: MainPageComponent, title: 'Inicio | AFRAM Group', canActivate: [authGuardFn]}, //
    {path: 'accounts', component: AccountsComponent,title: 'Cuentas | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'accounts/account/:id', component: AccountInfoComponent, title: 'Mi cuenta | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'accounts/new-account', component: NewAccountComponent, title: 'Nueva cuenta | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'fixed-terms', component: FixedTermsComponent, title: 'Mis plazos fijos | AFRAM Group'},
    {path: 'fixed-terms/new', component: NewFixedtermComponent, title: 'Nuevo plazo fijo | AFRAM Group',canActivate: [authGuardFn]  },
    {path: 'new-loan', component: NewLoanComponent, title:'Nuevo préstamo | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'list-loan', component: ListLoanComponent, title: 'Mis préstamos | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'pay-loan/:id', component: PayLoanComponent, title: 'Pagar préstamo | AFRAM Group', canActivate: [authGuardFn]  },
    {path: 'profile', component: ProfileComponent, title: 'Perfil | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'update-profile/:id', component: UpdateProfileComponent,title: 'Editar perfil | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'update-password', component: UpdatePasswordComponent, title: 'Cambiar contraseña | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'transfer', component: TransactionsPageComponent,title: 'Transferir | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'my-transactions', component: MyTransactionsComponent, title: 'Mis transacciones | AFRAM Group'  , canActivate: [authGuardFn]},
    {path: 'cards', component: CardComponent, title: 'Mis tarjetas | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'newcard', component: NewcardComponent, title: 'Nueva tarjeta | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'legal', component: LegalComponent, title: 'Legal | AFRAM Group'},
    {path: 'recover-password', component: RecoverPasswordComponent, title: 'Recuperar contraseña | AFRAM Group'},
    {path: 'new-password', component: NewPasswordComponent, title: 'Restablecer contraseña | AFRAM Group'},
    {path: 'access-denied', component: AccessDeniedComponent, title: 'Acceso denegado | AFRAM Group', canActivate: [authGuardFnlogOut]},
    {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


