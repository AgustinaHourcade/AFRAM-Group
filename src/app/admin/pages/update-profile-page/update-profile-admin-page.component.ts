import { Component } from '@angular/core';
import { UpdateProfileComponent } from '../../../users/components/update-profile/update-profile.component';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-update-profile-admin-page',
  standalone: true,
  imports: [NavbarAdminComponent, UpdateProfileComponent],
  templateUrl: './update-profile-admin-page.component.html',
  styleUrl: './update-profile-admin-page.component.css'
})
export class UpdateProfileAdminPageComponent {

}
