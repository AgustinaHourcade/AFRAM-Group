import { Component } from '@angular/core';
import { NavbarComponent } from "@shared/navbar/navbar.component";
import { UpdatePasswordComponent } from "@users/components/update-password/update-password.component";

@Component({
  selector: 'app-update-password-page',
  standalone: true,
  imports: [UpdatePasswordComponent, NavbarComponent],
  templateUrl: './update-password-page.component.html',
  styleUrl: './update-password-page.component.css'
})
export class UpdatePasswordPageComponent {

}
