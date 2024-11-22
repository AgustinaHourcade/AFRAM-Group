import { Component } from '@angular/core';
import { NavbarAdminComponent } from "../../shared/navbar-admin/navbar-admin.component";
import { ProfileComponent } from "../../../users/components/profile/profile.component";


@Component({
  selector: 'app-profile-admin',
  standalone: true,
  imports: [NavbarAdminComponent, ProfileComponent],
  templateUrl: './profile-admin.component.html',
  styleUrl: './profile-admin.component.css'
})
export class ProfileAdminComponent {

}
