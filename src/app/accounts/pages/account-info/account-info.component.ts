import { Component, inject, OnInit } from '@angular/core';
import { CbuAliasComponent } from '../../components/cbu-alias/cbu-alias.component';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';


@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CbuAliasComponent, NavbarComponent],
  templateUrl: './account-info.component.html',
  styleUrl: './account-info.component.css'
})
export class AccountInfoComponent{

}
