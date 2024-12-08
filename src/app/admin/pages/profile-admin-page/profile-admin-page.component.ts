import { Component } from '@angular/core';
import { ProfileComponent } from '@users/components/profile/profile.component';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-profile-admin-page',
  standalone: true,
  imports: [ProfileComponent, NavbarAdminComponent],
  templateUrl: './profile-admin-page.component.html',
  styleUrl: './profile-admin-page.component.css'
})
export class ProfileAdminPageComponent {

}
