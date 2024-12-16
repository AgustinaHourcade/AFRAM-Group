import { User } from '@users/interface/user.interface';
import { RouterLink } from '@angular/router';
import { UserService } from '@users/services/user.service';
import { NavbarAdminComponent } from '@admin/shared/navbar-admin/navbar-admin.component';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-admins',
  standalone: true,
  imports: [RouterLink, NavbarAdminComponent, ReactiveFormsModule],
  templateUrl: './list-admins.component.html',
  styleUrls: ['./list-admins.component.css']
})
export class ListAdminsComponent implements OnInit {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  admins: User[] = [];
  adminsFilter: User[] = [];

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
        this.admins = users.filter(user => user.user_type === 'admin');
        this.adminsFilter = [...this.admins];
      },
      error: (e: Error) => console.error(e.message)
    });

    this.filterForm.valueChanges.subscribe(() => this.applyFilter());
  }

  applyFilter() {
    const dni = this.filterForm.get('dni')?.value?.toString().trim();
    const lastName = this.filterForm.get('lastName')?.value?.trim();

    if (!dni && !lastName) {
      this.adminsFilter = [...this.admins];
      return;
    }

    this.adminsFilter = this.admins.filter((admin) => {
      const matchesDni = dni ? admin.dni.includes(dni) : true;
      const matchesLastName = lastName
        ? admin.last_name?.toLowerCase().includes(lastName.toLowerCase())
        : true;
      return matchesDni && matchesLastName;
    });
  }

  onClearFilter() {
    this.filterForm.reset();
    this.adminsFilter = [...this.admins];
  }
}
