import { Component } from '@angular/core';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";
import { UpdateProfileComponent } from '../../components/update-profile/update-profile.component';
import { User } from '@users/interface/user.interface';

@Component({
  selector: 'app-update-profile-page',
  standalone: true,
  imports: [NavbarComponent, UpdateProfileComponent],
  templateUrl: './update-profile-page.component.html',
  styleUrl: './update-profile-page.component.css'
})
export class UpdateProfilePageComponent {

 phone: string = '';

  onProfileUpdated(value: any) {
    this.phone = value.toString();
  }
}
