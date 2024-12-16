import { User } from '@users/interface/user.interface';
import { Address } from '@addresses/interface/address.interface';
import { RouterLink } from '@angular/router';
import { UserService } from '@users/services/user.service';
import { AddressService } from '@addresses/service/address.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  user ?: User;
  type ?:string;
  userId = 0;
  address ?: Address;

  private sesionService = inject(UserSessionService);
  private userService = inject(UserService);
  private addressService = inject(AddressService);

  ngOnInit(): void {
    this.userId = this.sesionService.getUserId();
    this.type = this.sesionService.getUserType() as string;
    console.log(this.type);

    if (this.userId !== undefined) {
      this.userService.getUser(this.userId).subscribe({
        next: (user) => {
          this.user = user;

          if (this.user.id !== undefined) {
            this.addressService.getAddressByUserId(this.user.id).subscribe({
              next: (address) => {
                this.address = address;
              },
              error: (e: Error) => {
                console.log(e.message);
              }
            });
          } else {
            console.log('Error: El ID de usuario es undefined');
          }
        },
        error: (e: Error) => {
          console.log(e.message);
        }
      });
    } else {
      console.log('Error: El ID de sesión es undefined');
    }
  }

}
