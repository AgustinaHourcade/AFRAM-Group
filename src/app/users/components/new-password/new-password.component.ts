import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UserService } from '@users/services/user.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavbarHomeComponent } from "@shared/navbar-home/navbar-home.component";
import { FormBuilder, AbstractControl, ValidationErrors, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarHomeComponent, NavbarHomeComponent, CommonModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.css'
})
export class NewPasswordComponent {

  private fb = inject(FormBuilder);
  private route = inject(Router);
  private userService = inject(UserService);

  flag: boolean = false;
  showPassword1: boolean = false;
  showPassword2: boolean = false;

  // Funcion para que la contraseña contenga una Mayuscula, Minuscila y algun numero.
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumber;
    return valid ? null : { passwordStrength: true };
  }

  // Funcion para verificar que ambas contraseñas sean iguales
  matchPasswords(group: FormGroup): ValidationErrors | null {
    const password = group.get('hashed_password')?.value;
    const confirmPassword = group.get('confirm_password')?.value;

    return password === confirmPassword ? null : { matchPasswords: true };
  }

  formularioToken = this.fb.group({
    token1: new FormControl<string>('', [Validators.required, Validators.maxLength(1)]),
    token2: new FormControl<string>('', [Validators.required, Validators.maxLength(1)]),
    token3: new FormControl<string>('', [Validators.required, Validators.maxLength(1)]),
    token4: new FormControl<string>('', [Validators.required, Validators.maxLength(1)]),
    token5: new FormControl<string>('', [Validators.required, Validators.maxLength(1)]),
    token6: new FormControl<string>('', [Validators.required, Validators.maxLength(1)]),
  }) as FormGroup;

  formularioContra = this.fb.group(
    {
      hashed_password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator.bind(this)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.matchPasswords }
  );

  moveFocus(event: any, nextInputId: string) {
    if (event.target.value.length === 1) {
      const nextInput = document.getElementById(nextInputId) as HTMLInputElement;

      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  handlePaste(event: ClipboardEvent) {
    const pastedData = event.clipboardData?.getData('text');
    if (pastedData && pastedData.length === 6) {
      const inputs = Array.from(document.querySelectorAll('.token-input')) as HTMLInputElement[];
      inputs.forEach((input, index) => {
        input.value = pastedData[index] || '';
        const control = this.formularioToken.get(`token${index + 1}`);
        if (control) {
          control.setValue(pastedData[index] || '');
        }
      });
      const lastInput = inputs[5];
      lastInput?.focus();
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword1 = !this.showPassword1;
    } else if (field === 'confirm') {
      this.showPassword2 = !this.showPassword2;
    }
  }

  // Verificacion del token enviado por email.
  verifyToken(){
    const token1= this.formularioToken.get('token1')?.value || '';
    const token2= this.formularioToken.get('token2')?.value || '';
    const token3= this.formularioToken.get('token3')?.value || '';
    const token4= this.formularioToken.get('token4')?.value || '';
    const token5= this.formularioToken.get('token5')?.value || '';
    const token6= this.formularioToken.get('token6')?.value || '';

    const token = token1 + token2 + token3 + token4 + token5 + token6;
    this.userService.getUserIdByToken(Number(token)).subscribe({
      next: ()=> this.flag=true,
      error: (err: Error) =>{
        Swal.fire({
          icon: "error",
          showCloseButton: true,
          title: "Token incorrecto",
          footer: '<a href="#">Reenviar mail</a>'
        });
      }
    })
  }

  // Funcion para cambiar la contraseña
  changePassword(){
    const token1= this.formularioToken.get('token1')?.value || '';
    const token2= this.formularioToken.get('token2')?.value || '';
    const token3= this.formularioToken.get('token3')?.value || '';
    const token4= this.formularioToken.get('token4')?.value || '';
    const token5= this.formularioToken.get('token5')?.value || '';
    const token6= this.formularioToken.get('token6')?.value || '';

    const newPassword = this.formularioContra.get('confirm_password')?.value;
    const token = token1 + token2 + token3 + token4 + token5 + token6;

    this.userService.getUserIdByToken(Number (token)).subscribe({
      next: (id) =>{
        this.userService.changePasswordById(newPassword as string, id).subscribe({
          next: () =>{
            Swal.fire({
              title: 'Se ha restablecido su contraseña.',
              icon: 'success',
            });
            this.userService.getUser(id).subscribe({
              next: (user) =>{
                if(Number (user.login_attempts) >= 3){
                  this.userService.unblockUser(user.dni).subscribe({
                    next: (flag) => this.route.navigate(['/auth']),
                    error: (e:Error) => console.log(e.message)
                  })
                }
                this.route.navigate(['/auth']);
              },error: (e: Error) => console.log(e.message)
            })
          },
          error: (e: Error) =>{
            Swal.fire({
              title: 'No se ha podido restablecer su contraseña.',
              icon: 'error',
            });
          }
        })
      },
      error: () =>{
        Swal.fire({
          title: 'El token ingresado no es válido.',
          icon: 'error',
        });
      }
    })
  }
}

