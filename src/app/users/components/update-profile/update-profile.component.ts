import { AddressService } from './../../../addresses/service/address.service';
import { User } from './../../interface/user.interface';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { UserService } from '../../services/user.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { Router } from '@angular/router';
import { Address } from '../../../addresses/interface/address.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './update-profile.component.html',
  styleUrl: './update-profile.component.css'
})
export class UpdateProfileComponent implements OnInit {

fb = inject(FormBuilder)
userService = inject(UserService);
sessionService = inject(UserSessionService);
addressService= inject(AddressService);
route = inject(Router);
flag = false;
id : number = 0;
user ?: User;
address ?: Address;

ngOnInit(): void {
  this.id = this.sessionService.getUserId();

  this.userService.getUser(this.id).subscribe({
    next: (data) => {
      this.user = data;
      this.addressService.getAddressByUserId(this.id).subscribe({
        next: (address) =>{
          this.address = address;
          this.setUser(data, this.address);
        }
      })
    },
    error: (e: Error) =>{
      console.log(e.message);
    }
  })

  
}


passwordValidator(control: AbstractControl) {
  const value = control.value;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  
  const valid = hasUpperCase && hasLowerCase && hasNumber
  
  return valid ? null : { passwordStrength: true };
}

matchPasswords(group: FormGroup): ValidationErrors | null {
  const password = group.get('hashed_password')?.value;
  const confirmPassword = group.get('confirm_password')?.value;

  return password === confirmPassword ? null : { matchPasswords: true };
}


formulario = this.fb.nonNullable.group({
  email: ['', [Validators.required, Validators.email]],
  phone: ['', [Validators.required, Validators.pattern('^[0-9]{8,10}$')]],
  street: ['', [Validators.required]],
  address_number: [0, [Validators.required, Validators.pattern('^[0-9]{1,5}$')]],
  floor: [''],
  apartment: [''],
  city: ['', [Validators.required]],
  postal_code: ['', [Validators.required]],
  country: ['', [Validators.required]],
})

setUser(user:  User | undefined , address: Address) {
  this.formulario.controls['email'].setValue(user!.email ?? '');
  this.formulario.controls['phone'].setValue(user!.phone ?? '');
  this.formulario.controls['street'].setValue(address.street)
  this.formulario.controls['address_number'].setValue(address.address_number)
  this.formulario.controls['floor'].setValue(address.floor ?? '')
  this.formulario.controls['apartment'].setValue(address.apartment ?? '')
  this.formulario.controls['city'].setValue(address.city)
  this.formulario.controls['postal_code'].setValue(address.postal_code)
  this.formulario.controls['country'].setValue(address.country)

}

formularioContra = this.fb.group({
  current_password: ['', [Validators.required, Validators.minLength(6)]],
  hashed_password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator.bind(this), this.matchPasswords.bind(this)]],
  confirm_password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator.bind(this), this.matchPasswords.bind(this)]]
},{ validators: this.matchPasswords }
);


updateAddress(){
  if(this.formulario.invalid) return;

  const data = {
    street: this.formulario.controls['street']?.value,
    address_number: this.formulario.controls['address_number']?.value,
    floor: this.formulario.controls['floor']?.value,
    apartment: this.formulario.controls['apartment']?.value,
    city: this.formulario.controls['city']?.value,
    postal_code: this.formulario.controls['postal_code']?.value,
    country: this.formulario.controls['country']?.value,
    user_id: this.id
  }

  this.addressService.updateAddress(data, this.id).subscribe({
    next: (data) =>{
      this.address = data;
      this.route.navigate(['/profile']);
    },
    error: (err: Error) =>{
      console.log(err.message);
    }
  })
}


updateProfile(){
  if(this.formulario.invalid) return;
  
  
  const datos = {
    email: this.formulario.controls['email']?.value,
    phone: this.formulario.controls['phone']?.value
  }
  
  this.userService.updateUser(datos, this.id).subscribe({
    next:() =>{
      this.updateAddress();
      console.log("Datos actualizados!");
      this.route.navigate(['/profile']);
    },
    error: (err: Error)=>{
      console.log("Error al actualizar los datos.", err.message);
    }
  })
}

updatePassword(){

  if(this.formularioContra.invalid) return;

  if((this.formularioContra.controls['hashed_password']?.value  !== this.formularioContra.controls['confirm_password']?.value)){
    console.log("NO COINCIDEN")
    this.flag = true;
    return;
  }
  else{
    const datos = {
      currentPassword: this.formularioContra.controls['current_password'].value,
      newPassword: this.formularioContra.controls['confirm_password'].value
    }
    this.userService.changePassword(this.id, datos).subscribe({
      next:() =>{
        console.log("Contraseña actualizada!");
        this.route.navigate(['/profile']);
      },
      error: (err: Error)=>{
        console.log("Error al actualizar las contraseñas.", err.message);
      }
    })
  }
}
}
