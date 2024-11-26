import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../../users/interface/user.interface';
import { RouterLink } from '@angular/router';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-admins',
  standalone: true,
  imports: [RouterLink, NavbarAdminComponent, ReactiveFormsModule],
  templateUrl: './list-admins.component.html',
  styleUrls: ['./list-admins.component.css']
})
export class ListAdminsComponent implements OnInit {

  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  admins: Array<User> = [];
  adminsFilter: Array<User> = [];

  filterForm = this.fb.nonNullable.group({
    dni: [''],
    lastName: [''],
  });

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.admins = users.filter(user => user.user_type === 'admin');
        this.adminsFilter = [...this.admins]; // Inicializa el filtro con todos los administradores
      },
      error: (e: Error) => {
        console.error(e.message);
      }
    });

    this.filterForm.valueChanges.subscribe(() => this.applyFilter());
  }

  applyFilter() {
    const dni = this.filterForm.get('dni')?.value.trim();
    const lastName = this.filterForm.get('lastName')?.value.trim();

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
    this.adminsFilter = [...this.admins]; // Resetea los resultados del filtro
  }
}
