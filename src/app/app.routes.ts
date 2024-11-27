import { ListRatesComponent } from './admin/components/list-rates/list-rates.component';
import { TransactionsPageComponent } from './transactions/pages/transactions-page/transactions-page.component';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthPageComponent } from './auth/pages/auth-page/auth-page.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AccountsComponent } from './accounts/pages/accounts/accounts.component';
import { AccountInfoComponent } from './accounts/pages/account-info/account-info.component';
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
import { AdminMainPageComponent } from './admin/pages/admin-main-page/admin-main-page.component';
import { ListAdminsComponent } from './admin/components/list-admins/list-admins.component';
import { DetailAdminComponent } from './admin/components/detail-admin/detail-admin.component';
import { ListUsersComponent } from './admin/components/list-users/list-users.component';
import { DetailUsersComponent } from './admin/components/detail-users/detail-users.component';
import { UpdateProfilePageComponent } from './users/pages/update-profile-page/update-profile-page.component';
import { ProfilePageComponent } from './users/pages/profile-page/profile-page.component';
import { NewAdminComponent } from './admin/components/new-admin/new-admin.component';
import { ListTransactionComponent } from './admin/components/list-transaction/list-transaction.component';
import { ProfileAdminPageComponent } from './admin/pages/profile-admin-page/profile-admin-page.component';
import { UpdateProfileAdminPageComponent } from './admin/pages/update-profile-page/update-profile-admin-page.component';
import { UpdatePasswordPageComponent } from './users/pages/update-password-page/update-password-page.component';
import { UpdatePasswordAdminPageComponent } from './admin/pages/update-password-admin-page/update-password-admin-page.component';
import { MySupportsComponent } from './support/components/my-supports/my-supports.component';


export const routes: Routes = [
    // Extra Routes
    {path: '', component: HomeComponent, title: 'Bienvenido | AFRAM Group'},
    {path: 'auth',component: AuthPageComponent, title: 'Inicio sesión | AFRAM Group'},
    {path: 'legal', component: LegalComponent, title: 'Legal | AFRAM Group'},
    {path: 'recover-password', component: RecoverPasswordComponent, title: 'Recuperar contraseña | AFRAM Group'},
    {path: 'new-password', component: NewPasswordComponent, title: 'Restablecer contraseña | AFRAM Group'},
    // Access Denied Route
    {path: 'access-denied', component: AccessDeniedComponent, title: 'Acceso denegado | AFRAM Group', canActivate: [authGuardFnlogOut]},
    // User Routes
    {path: 'main', component: MainPageComponent, title: 'Inicio | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'accounts', component: AccountsComponent,title: 'Cuentas | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'accounts/account/:id', component: AccountInfoComponent, title: 'Mi cuenta | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'accounts/new-account', component: NewAccountComponent, title: 'Nueva cuenta | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'fixed-terms', component: FixedTermsComponent, title: 'Mis plazos fijos | AFRAM Group',canActivate: [authGuardFn]},
    {path: 'fixed-terms/new', component: NewFixedtermComponent, title: 'Nuevo plazo fijo | AFRAM Group',canActivate: [authGuardFn]  },
    {path: 'new-loan', component: NewLoanComponent, title:'Nuevo préstamo | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'list-loan', component: ListLoanComponent, title: 'Mis préstamos | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'pay-loan/:id', component: PayLoanComponent, title: 'Pagar préstamo | AFRAM Group', canActivate: [authGuardFn] },
    {path: 'profile', component: ProfilePageComponent, title: 'Perfil | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'update-profile', component: UpdateProfilePageComponent ,title: 'Editar perfil | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'update-password', component: UpdatePasswordPageComponent, title: 'Cambiar contraseña | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'transfer', component: TransactionsPageComponent,title: 'Transferir | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'my-transactions', component: MyTransactionsComponent, title: 'Mis transacciones | AFRAM Group'  , canActivate: [authGuardFn]},
    {path: 'cards', component: CardComponent, title: 'Mis tarjetas | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'newcard', component: NewcardComponent, title: 'Nueva tarjeta | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'list-users', component: ListUsersComponent, title: 'Lista Clientes | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'support', component: MySupportsComponent, title: 'Mis consultas | AFRAM Group', canActivate: [authGuardFn]},
    //Admin Routes
    {path: 'admin-main', component: AdminMainPageComponent, title: 'Home | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'list-admins', component: ListAdminsComponent, title: 'Lista Administradores | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'detail-admin/:id', component: DetailAdminComponent, title: 'Detalles del Admin | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'detail-user/:id', component: DetailUsersComponent, title: 'Detalles del Cliente | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'new-admin', component: NewAdminComponent, title: 'Nuevo usuario | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'list-rates', component: ListRatesComponent, title: 'Lista de Tasas | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'list-transaction/:id', component: ListTransactionComponent, title: 'Lista de Transacciones | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'update-profile-admin', component: UpdateProfileAdminPageComponent, title: 'Actualizar perfil | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'admin-profile', component: ProfileAdminPageComponent, title: 'Ver perfil | AFRAM Group', canActivate: [authGuardFn]},
    {path: 'update-password-admin', component: UpdatePasswordAdminPageComponent, title: 'Cambiar contraseña | AFRAM Group', canActivate: [authGuardFn]},
    {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


