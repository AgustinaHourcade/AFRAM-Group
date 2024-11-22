import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../users/services/user.service';
import { RouterLink } from '@angular/router';
import { User } from '../../../users/interface/user.interface';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-list-users',
  standalone: true,
  imports: [RouterLink, NavbarAdminComponent],
  templateUrl: './list-users.component.html',
  styleUrl: './list-users.component.css'
})
export class ListUsersComponent implements OnInit{

  private userService = inject(UserService)
  clients: Array<User> = [];


  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) =>{
        users.forEach(user => {
          if (user.user_type === 'user') {
            this.clients.push(user);
          }
        });
      },
      error: (e: Error) =>{
        console.error(e.message);
      }
    })
  }


}

