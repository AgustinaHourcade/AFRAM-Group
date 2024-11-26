import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../../users/interface/user.interface';
import { RouterLink } from '@angular/router';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-list-admins',
  standalone: true,
  imports: [RouterLink, NavbarAdminComponent],
  templateUrl: './list-admins.component.html',
  styleUrl: './list-admins.component.css'
})
export class ListAdminsComponent implements OnInit{

  private userService = inject(UserService)
  admins: Array<User> = [];


  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) =>{
        users.forEach(user => {
          if (user.user_type === 'admin') {
            this.admins.push(user);
          }
        });
      },
      error: (e: Error) =>{
        console.error(e.message);
      }
    })
  }


}
