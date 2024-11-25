import Swal from 'sweetalert2';
import { AddressService } from './../../../addresses/service/address.service';
import { User } from './../../interface/user.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { Router } from '@angular/router';
import { Address } from '../../../addresses/interface/address.interface';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [ ReactiveFormsModule],
  templateUrl: './update-profile.component.html',
  styleUrl: './update-profile.component.css',
})
export class UpdateProfileComponent implements OnInit {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  sessionService = inject(UserSessionService);
  addressService = inject(AddressService);
  route = inject(Router);
  type !:string;
  flag = false;
  id: number = 0;
  user?: User;
  address?: Address;

  ngOnInit(): void {
    this.id = this.sessionService.getUserId();
    this.type = this.sessionService.getUserType() as string;

    this.userService.getUser(this.id).subscribe({
      next: (data) => {
        this.user = data;
        this.addressService.getAddressByUserId(this.id).subscribe({
          next: (address) => {
            this.address = address;
            this.setUser(data, this.address);
          },
        });
      },
      error: (e: Error) => {
        console.log(e.message);
      },
    });
  }

  formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    phone: [0, [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
    street: ['', [Validators.required]],
    address_number: [
      0,
      [Validators.required, Validators.pattern('^[0-9]{1,5}$')],
    ],
    floor: [''],
    apartment: [''],
    city: ['', [Validators.required]],
    postal_code: [0, [Validators.required]],
    country: ['', [Validators.required]],
  });

  setUser(user: User | undefined, address: Address) {
    if (user!.email?.includes('@example')) {
      this.formulario.controls['email'].setValue('');
    } else {
      this.formulario.controls['email'].setValue(user!.email ?? '');
    }

    this.formulario.controls['phone'].setValue(user!.phone ?? 0);
    this.formulario.controls['street'].setValue(address.street);
    this.formulario.controls['address_number'].setValue(address.address_number);
    this.formulario.controls['floor'].setValue(address.floor ?? '');
    this.formulario.controls['apartment'].setValue(address.apartment ?? '');
    this.formulario.controls['city'].setValue(address.city);
    this.formulario.controls['postal_code'].setValue(address.postal_code);
    this.formulario.controls['country'].setValue(address.country);
  }

  updateAddress() {
    if (this.formulario.invalid) return;

    const data = {
      street: this.formulario.controls['street']?.value,
      address_number: this.formulario.controls['address_number']?.value,
      floor: this.formulario.controls['floor']?.value,
      apartment: this.formulario.controls['apartment']?.value,
      city: this.formulario.controls['city']?.value,
      postal_code: this.formulario.controls['postal_code']?.value,
      country: this.formulario.controls['country']?.value,
      user_id: this.id,
    };

    this.addressService.updateAddress(data, this.id).subscribe({
      next: (data) => {
        this.address = data;
      },
      error: (err: Error) => {
        console.log(err.message);
      },
    });
  }

  updateProfile() {
    if (this.formulario.invalid) return;

    const datos = {
      email: this.formulario.controls['email']?.value,
      phone: this.formulario.controls['phone']?.value,
    };

    this.userService.updateUser(datos, this.id).subscribe({
      next: () => {
        this.updateAddress();
        Swal.fire({
          title: 'Datos actualizados correctamente!',
          icon: 'success',
        });
        if(this.type === 'user'){
          this.route.navigate(['/profile']);
        }
        this.route.navigate(['/admin-profile']);
      },
      error: (err: Error) => {
        console.log('Error al actualizar los datos.', err.message);
      },
    });
  }
}
