import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '@users/services/user.service';
import { User } from '@users/interface/user.interface';
import { NavbarAdminComponent } from '@admin/shared/navbar-admin/navbar-admin.component';


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

  preventNumbers(event: KeyboardEvent): void {
    const regex = /[0-9]/;
    if (regex.test(event.key)) {
      event.preventDefault();
    }
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.clients = users;
        this.clientsFilter = users;
      },
      error: (e: Error) => {
        console.error(e.message);
      },
    });

    this.filterForm.valueChanges.subscribe(() => this.applyFilter());
  }

  applyFilter() {
    const dni = this.filterForm.get('dni')?.value?.toString().trim();
    const lastName = this.filterForm.get('lastName')?.value?.trim();
  
    if (!dni && !lastName) {
      this.clientsFilter = [...this.clients];
      return;
    }
  
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
