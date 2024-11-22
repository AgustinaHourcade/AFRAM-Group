import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarAdminComponent } from "../../shared/navbar-admin/navbar-admin.component";

@Component({
  selector: 'app-admin-main-page',
  standalone: true,
  imports: [RouterLink, NavbarAdminComponent],
  templateUrl: './admin-main-page.component.html',
  styleUrl: './admin-main-page.component.css'
})
export class AdminMainPageComponent {

}
