import { TransactionsPageComponent } from './transactions/pages/transactions-page/transactions-page.component';
import { Routes } from '@angular/router';
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


export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'auth',component: AuthPageComponent},
    {path: 'main', component: MainPageComponent},
    {path: 'accounts', component: AccountsComponent},
    {path: 'accounts/account/:id', component: AccountInfoComponent},
    {path: 'fixed-terms', component: FixedtermComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'update-profile/:id', component: UpdateProfileComponent},
    {path: 'transactions', component: TransactionsPageComponent},
    {path: 'my-transactions', component: MyTransactionsComponent},
    {path: 'cards', component: CardComponent},
    {path: 'newcard', component: NewcardComponent},
    {path: '**', redirectTo: ''}
];
