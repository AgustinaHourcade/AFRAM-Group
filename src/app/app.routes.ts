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
import { FixedtermComponent } from './fixedTerms/components/fixedterm/fixedterm.component';
import { CardComponent } from './cards/components/card/card.component';
import { NewcardComponent } from './cards/components/newcard/newcard.component';
import { NewAccountComponent } from './accounts/components/new-account/new-account.component';
import { UpdatePasswordComponent } from './users/components/update-password/update-password.component';
import { NgModule } from '@angular/core';
import { LegalComponent } from './pages/legal/legal.component';


export const routes: Routes = [
    {path: '', component: HomeComponent, title: 'Bienvenido | AFRAM Group'},
    {path: 'auth',component: AuthPageComponent, title: 'Inicio secion | AFRAM Group'},
    {path: 'main', component: MainPageComponent, title: 'Inicio | AFRAM Group'},
    {path: 'accounts', component: AccountsComponent,title: 'Cuentas | AFRAM Group'},
    {path: 'accounts/account/:id', component: AccountInfoComponent, title: 'Mi cuenta | AFRAM Group'},
    {path: 'accounts/new-account', component: NewAccountComponent, title: 'Nueva cuenta | AFRAM Group'},
    {path: 'fixed-terms', component: FixedtermComponent, title: 'Mis plazos fijos | AFRAM Group'},
    {path: 'profile', component: ProfileComponent, title: 'Perfil | AFRAM Group'},
    {path: 'update-profile/:id', component: UpdateProfileComponent,title: 'Editar perfil | AFRAM Group'},
    {path: 'update-password', component: UpdatePasswordComponent, title: 'Cambiar contraseña | AFRAM Group'},
    {path: 'transactions', component: TransactionsPageComponent,title: 'Transferencias | AFRAM Group'},
    {path: 'my-transactions', component: MyTransactionsComponent, title: 'Mis transacciones | AFRAM Group'  },
    {path: 'cards', component: CardComponent, title: 'Mis tarjetas | AFRAM Group'},
    {path: 'newcard', component: NewcardComponent, title: 'Nueva tarjeta | AFRAM Group'},
    {path: 'legal', component: LegalComponent, title: 'Legal | AFRAM Group' },
    {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


