import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../users/services/user.service';
import { RouterLink } from '@angular/router';
import { User } from '../../../users/interface/user.interface';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-list-users',
  standalone: true,
  imports: [RouterLink, NavbarAdminComponent, ReactiveFormsModule],
  templateUrl: './list-users.component.html',
  styleUrl: './list-users.component.css',
})
export class ListUsersComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  clients: Array<User> = [];
  clientsFilter: Array<User> = [];

  filterForm = this.fb.nonNullable.group({
    dni: [''],
    lastName: [''],
  });

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.clients = users.filter((user) => user.user_type === 'user');
        this.clientsFilter = [...this.clients]; 
      },
      error: (e: Error) => {
        console.error(e.message);
      },
    });

    this.filterForm.valueChanges.subscribe(() => this.applyFilter());
  }

  applyFilter() {
    const dni = this.filterForm.get('dni')?.value.trim();
    const lastName = this.filterForm.get('lastName')?.value.trim();

    this.clientsFilter = this.clients.filter((client) => {
      const matchesDni = dni ? client.dni.includes(dni) : true;
      const matchesLastName = lastName
        ? client.last_name?.toLowerCase().includes(lastName.toLowerCase())
        : true;
      return matchesDni && matchesLastName;
    });
  }

  onClearFilter() {
    this.filterForm.reset();
    this.clientsFilter = [...this.clients]; 
  }
}
