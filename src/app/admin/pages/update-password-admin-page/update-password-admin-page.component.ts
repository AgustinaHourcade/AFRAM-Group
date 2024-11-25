import { Component } from '@angular/core';
import { UpdatePasswordComponent } from '../../../users/components/update-password/update-password.component';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-update-password-admin-page',
  standalone: true,
  imports: [NavbarAdminComponent, UpdatePasswordComponent],
  templateUrl: './update-password-admin-page.component.html',
  styleUrl: './update-password-admin-page.component.css'
})
export class UpdatePasswordAdminPageComponent {

}
