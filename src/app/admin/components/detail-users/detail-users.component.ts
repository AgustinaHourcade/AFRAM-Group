import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { User } from '../../../users/interface/user.interface';
import { UserService } from '../../../users/services/user.service';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';
import { AccountService } from '../../../accounts/services/account.service';
import { Account } from '../../../accounts/interface/account.interface';

@Component({
  selector: 'app-detail-users',
  standalone: true,
  imports: [NavbarAdminComponent],
  templateUrl: './detail-users.component.html',
  styleUrl: './detail-users.component.css'
})
export class DetailUsersComponent implements OnInit{

  private activatedRoute = inject(ActivatedRoute);
  private userService = inject(UserService);
  private accountService = inject(AccountService);
  private router = inject(Router)
  user ?: User;
  accounts: Array<Account> = [];
  flag = false;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        this.userService.getUser(Number(id)).subscribe({
          next: (user) => {
            this.user = user;
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
    if(this.user?.is_Active === 'yes'){
      isActive = 'no'
    }else{
      isActive = 'yes'
    }
    this.userService.changeStatus(Number(this.user?.id), isActive ).subscribe({
      next: (flag) => {
        if(isActive == 'yes'){
          Swal.fire({
            title: "Usuario dado de alta",
            text: 'EL usuario '+this.user?.real_name+', '+this.user?.last_name +' fue dado de alta en el sistema.',
            icon: "success",
            confirmButtonText: 'Aceptar'
          });
        }else{
          Swal.fire({
            title: "Usuario dado de baja",
            text: 'El usuario ' + this.user?.real_name + ', ' + this.user?.last_name + ' fue dado de baja en el sistema.',
            icon: "success",
            confirmButtonText: 'Aceptar'
          });
        }
        this.router.navigate(['list-users']);
      },
      error: (e: Error)=>{
        console.log(e.message);
      }
    })
  }

  loadAccounts(){

    this.accountService.getAccountsByIdentifier(Number (this.user?.id)).subscribe({
      next: (accounts) =>{
        this.accounts = accounts;
      },
      error: (e: Error) =>{
        console.log(e.message);
      }
    })

    this.flag = true;
  }

  formatearFecha(date : Date){
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formattedDate;
  }

  changeStatusAcount(id: number){
      this.accountService.deactivateAccount(id).subscribe({
        next: (data) => {
          Swal.fire({
            title: '¿Está seguro que desea dar de baja la cuenta numero '+id+', perteneciente a '+this.user?.real_name+' '+this.user?.last_name+'?',
            text:'Esta accion es irreversible',
            icon: 'warning',
            iconColor: '#0077b6',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, dar de baja',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if(result.isConfirmed){
              Swal.fire({
                title: "Cuenta dada de baja",
                text: 'La cuenta numero '+id+ ' fue dada de baja correctamente',
                icon: "success",
                confirmButtonText: 'Aceptar'
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.reload();
                }
            });
          }
        });
      },
        error: (e: Error) =>{
          console.log(e.message);
        }
      })
  }

  changeAdminStatus() {
    Swal.fire({
      title: '¿Está seguro que desea dar el rol de administrador a ' + this.user?.real_name + ' ' + this.user?.last_name + '?',
      icon: 'warning',
      iconColor: '#0077b6',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, hacer admin',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.changeAdminStatus(Number(this.user?.id), 'admin').subscribe({
          next: (data) => {
            Swal.fire({
              title: 'Rol concedido correctamente',
              text: 'Ahora ' + this.user?.real_name + ' ' + this.user?.last_name + ' es administrador',
              icon: "success",
              confirmButtonText: 'Aceptar',
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('list-users');
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


