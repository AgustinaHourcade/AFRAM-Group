import { Message } from './../../../shared/chat-bot/interface/chat.interface';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { User } from '../../interface/user.interface';
import { RouterLink } from '@angular/router';
import { AddressService } from '../../../addresses/service/address.service';
import { Address } from '../../../addresses/interface/address.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  userId: number = 0;
  user ?: User;
  address ?: Address;
  sesionService = inject(UserSessionService);
  userService = inject(UserService);
  addressService = inject(AddressService);

  ngOnInit(): void {
    this.userId = this.sesionService.getUserId();

    // Verifica si userId no es undefined
    if (this.userId !== undefined) {
      this.userService.getUser(this.userId).subscribe({
        next: (user) => {
          this.user = user;

          // Verifica que user.id no sea undefined antes de llamar a addressService
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
