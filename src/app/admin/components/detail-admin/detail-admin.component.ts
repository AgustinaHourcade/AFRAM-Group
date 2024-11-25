import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../users/services/user.service';
import { User } from '../../../users/interface/user.interface';
import Swal from 'sweetalert2';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-detail-admin',
  standalone: true,
  imports: [NavbarAdminComponent, RouterModule],
  templateUrl: './detail-admin.component.html',
  styleUrl: './detail-admin.component.css'
})
export class DetailAdminComponent implements OnInit{

  private activatedRoute = inject(ActivatedRoute);
  private userService = inject(UserService);
  private router = inject(Router)
  admin ?: User;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        this.userService.getUser(Number(id)).subscribe({
          next: (user) => {
            this.admin = user;
          },
          error: (e :Error) =>{
            console.error(e.message);
          }
        })
      }
    })
  }

  changeStatus() : void {
    let isActive = ''
    if(this.admin?.is_Active === 'yes'){
      isActive = 'no'
    }else{
      isActive = 'yes'
    }
    this.userService.changeStatus(Number(this.admin?.id), isActive ).subscribe({
      next: (flag) => {
        if(isActive == 'yes'){
          Swal.fire({
            title: "Administrador dado de alta",
            text: 'EL administrador '+this.admin?.real_name+', '+this.admin?.last_name +' fue dado de alta en el sistema.',
            icon: "success",
            confirmButtonText: 'Aceptar'
          });
        }else{
          Swal.fire({
            title: "Administrador dado de baja",
            text: 'El Administrador ' + this.admin?.real_name + ', ' + this.admin?.last_name + ' fue dado de baja en el sistema.',
            icon: "success",
            confirmButtonText: 'Aceptar'
          });
        }
        this.router.navigate(['list-admins'])
      },
      error: (e: Error)=>{
        console.log(e.message);
      }
    })
  }

  changeAdminStatus() {
    Swal.fire({
      title: '¿Está seguro que desea quitar el rol de administrador a ' + this.admin?.real_name + ' ' + this.admin?.last_name + '?',
      icon: 'warning',
      iconColor: '#0077b6',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.changeAdminStatus(Number(this.admin?.id), 'user').subscribe({
          next: (data) => {
            Swal.fire({
              title: 'Rol quitado correctamente',
              text: 'Ahora ' + this.admin?.real_name + ' ' + this.admin?.last_name + ' no tiene rol de administrador',
              icon: "success",
              confirmButtonText: 'Aceptar',
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('list-admins');
              }
            });
          },
          error: (e: Error) => {
            console.log(e.message);
          }
        });
      }
    });
  }

}
