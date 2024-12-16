import Swal from 'sweetalert2';
import { User } from '@users/interface/user.interface';
import { UserService } from '@users/services/user.service';
import { NavbarAdminComponent } from '@admin/shared/navbar-admin/navbar-admin.component';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-detail-admin',
  standalone: true,
  imports: [NavbarAdminComponent, RouterModule],
  templateUrl: './detail-admin.component.html',
  styleUrl: './detail-admin.component.css'
})
export class DetailAdminComponent implements OnInit{

  // Dependency injection
  private router = inject(Router)
  private userService = inject(UserService);
  private activatedRoute = inject(ActivatedRoute);

  // Variable
  admin ?: User;

  //Functions
  ngOnInit(): void {
    // Subscribe to route parameters to fetch the admin data based on the 'id' parameter
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        this.userService.getUser(Number(id)).subscribe({
          next: (user) => this.admin = user, // Assign the fetched user to 'admin'
          error: () => this.router.navigate(['/not-found']) // Navigate to 'not-found' page in case of error
        })
      }
    })
  }

  // Toggle admin active/inactive status
  changeStatus() : void {
    let isActive = ''
    if(this.admin?.is_Active === 'yes'){
      isActive = 'no'
    }else{
      isActive = 'yes'
    }
    this.userService.changeStatus(Number(this.admin?.id), isActive ).subscribe({
      next: () => {
        if(isActive == 'yes'){
          Swal.fire({
            title: "Administrador dado de alta correctamente!",
            text: 'EL administrador '+this.admin?.real_name+', '+this.admin?.last_name +' fue dado de alta en el sistema.',
            icon: "success",
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8'
          });
        }else{
          Swal.fire({
            title: "Administrador dado de baja correctamente!",
            text: 'El Administrador ' + this.admin?.real_name + ', ' + this.admin?.last_name + ' fue dado de baja en el sistema.',
            icon: "success",
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8'
          });
        }
        this.router.navigate(['list-admins']) // Redirect to the admin list page
      },
      error: (e: Error) => console.log(e.message)
    })
  }

  // Change the admin's role to a regular user
  changeAdminStatus() {
    Swal.fire({
      title: '¿Está seguro que desea quitar el rol de administrador a ' + this.admin?.real_name + ' ' + this.admin?.last_name + '?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00b4d8',
      cancelButtonColor: "#e63946"
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.changeAdminStatus(Number(this.admin?.id), 'user').subscribe({
          next: () => {
            Swal.fire({
              title: 'Rol quitado correctamente!',
              text: 'Ahora ' + this.admin?.real_name + ' ' + this.admin?.last_name + ' no tiene rol de administrador.',
              icon: "success",
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#00b4d8',
            }).then((result) => {
              if (result.isConfirmed) {
                // Redirect after success
                this.router.navigateByUrl('list-admins');
              }
            });
          },
          error: (e: Error) => console.log(e.message)
        });
      }
    });
  }
}
