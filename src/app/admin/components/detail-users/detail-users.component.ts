import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { User } from '@users/interface/user.interface';
import { UserService } from '@users/services/user.service';
import { Account } from '@accounts/interface/account.interface';
import { AccountService } from '@accounts/services/account.service';
import { NavbarAdminComponent } from '@admin/shared/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-detail-users',
  standalone: true,
  imports: [NavbarAdminComponent, RouterModule],
  templateUrl: './detail-users.component.html',
  styleUrl: './detail-users.component.css'
})
export class DetailUsersComponent implements OnInit{

  private router = inject(Router)
  private userService = inject(UserService);
  private activatedRoute = inject(ActivatedRoute);
  private accountService = inject(AccountService);

  user ?: User;
  flag = false;
  accounts: Array<Account> = [];

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

  // Function to change the status user. (is_Active = yes || no)
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
            title: "Usuario dado de alta correctamente!",
            text: 'EL usuario '+this.user?.real_name+', '+this.user?.last_name +' fue dado de alta en el sistema.',
            icon: "success",
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8',
          });
        }else{
          Swal.fire({
            title: "Usuario dado de baja correctamente!",
            text: 'El usuario ' + this.user?.real_name + ', ' + this.user?.last_name + ' fue dado de baja en el sistema.',
            icon: "success",
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8'
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
    this.flag = true;
    this.accountService.getAccountsByIdentifier(Number (this.user?.id)).subscribe({
      next: (accounts) =>{
        this.accounts = accounts;
        setTimeout(() => {
          this.scrollToBottom();
        }, 300);
      },
      error: (e: Error) =>{
        console.log(e.message);
      }
    })
  }

  formatearFecha(date : Date){
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formattedDate;
  }

  // Function to change the status acount.
  changeStatusAcount(id: number){
      this.accountService.deactivateAccount(id).subscribe({
        next: (data) => {
          Swal.fire({
            title: '¿Está seguro que desea dar de baja la cuenta numero '+id+', perteneciente a '+this.user?.real_name+' '+this.user?.last_name+'?',
            text:'Esta accion es irreversible.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#00b4d8',
            cancelButtonColor: "#e63946",
            confirmButtonText: 'Si, dar de baja',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if(result.isConfirmed){
              Swal.fire({
                title: "Cuenta dada de baja correctamente!",
                text: 'La cuenta numero '+id+ ' fue dada de baja correctamente.',
                icon: "success",
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#00b4d8'
              }).then((result) => {
                if (result.isConfirmed) {
                  this.loadAccounts();
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

  // Function to change the rol user to admin
  changeAdminStatus() {
    Swal.fire({
      title: '¿Está seguro que desea dar el rol de administrador a ' + this.user?.real_name + ' ' + this.user?.last_name + '?',
      icon: 'warning',
      iconColor: '#0077b6',
      showCancelButton: true,
      confirmButtonColor: '#00b4d8',
      cancelButtonColor: "#e63946",
      confirmButtonText: 'Sí, hacer admin',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.changeAdminStatus(Number(this.user?.id), 'admin').subscribe({
          next: (data) => {
            Swal.fire({
              title: 'Rol concedido correctamente!',
              text: 'Ahora ' + this.user?.real_name + ' ' + this.user?.last_name + ' es administrador.',
              icon: "success",
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#00b4d8'
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

  scrollToBottom() {
    const lastElement = document.querySelector('.tr:last-child');
    if (lastElement) {
      lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

}


