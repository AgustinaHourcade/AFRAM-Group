import { User } from '@users/interface/user.interface';
import { RouterLink } from '@angular/router';
import { UserService } from '@users/services/user.service';
import { NavbarAdminComponent } from '@admin/shared/navbar-admin/navbar-admin.component';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-list-users',
  standalone: true,
  imports: [RouterLink, NavbarAdminComponent, ReactiveFormsModule],
  templateUrl: './list-users.component.html',
  styleUrl: './list-users.component.css',
})
export class ListUsersComponent implements OnInit {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  clients: User[] = [];
  clientsFilter: User[] = [];

  filterForm = this.fb.nonNullable.group({
    dni: [''],
    lastName: [''],
  });

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.clients = users;
        this.clientsFilter = users;
      },
      error: (e: Error) => console.error(e.message)
    });

    this.filterForm.valueChanges.subscribe(() => this.applyFilter());
  }

  preventNumbers(event: KeyboardEvent): void {
    const regex = /[0-9]/;
    if (regex.test(event.key)) {
      event.preventDefault();
    }
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
