import { Component } from '@angular/core';
import { NavbarComponent } from "@shared/navbar/navbar.component";
import { ProfileComponent } from "@users/components/profile/profile.component";

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ProfileComponent, NavbarComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {

}
