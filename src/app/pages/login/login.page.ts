import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { EMPTY, switchMap, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { fireToast } from '../../shared/functions/fire-toast.function';
import { UserRole } from 'src/app/shared/enums/user-role.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form: FormGroup;
  loaders = { submit: false };

  isPasswordShown = false;

  constructor(
    private authService: AuthService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private router: Router
  ) {}

  @HostListener('window:keydown.enter')
  signIn() {
    if (this.form.valid) {
      this.recaptchaV3Service
        .execute('login')
        .pipe(
          tap((_) => {
            this.loaders.submit = true;
          }),
          switchMap((recaptcha) => {
            if (recaptcha) {
              const formData = { ...this.form.value, recaptcha };
              return this.authService.signIn(formData);
            }
            return EMPTY;
          })
        )
        .subscribe({
          next: (response) => {
            if (!response.success || !response.payload) {
              return this.displayLoginError();
            }
            this.form.reset();
            this.loaders.submit = false;
            const decodedToken = this.authService.decodeAccessToken(
              response.payload.accessToken
            );

            this.router.navigate([
              'admin',
              {
                outlets: {
                  admin:
                    decodedToken.role === UserRole.ADMIN
                      ? 'painel'
                      : 'produtos',
                },
              },
            ]);
          },
          error: () => {
            this.displayLoginError();
          },
          complete: () => {
            this.loaders.submit = false;
          },
        });
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50),
        Validators.email,
      ]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  displayLoginError() {
    fireToast(
      'Erro',
      'Você tem certeza que preencheu todos os dados corretamente?',
      'error'
    );
    this.loaders.submit = false;
  }

  changeControl(control: string, value: any) {
    this.form.get(control).markAsDirty();
    this.form.get(control).markAsTouched();
    this.form.get(control).patchValue(value);
    this.form.get(control).updateValueAndValidity();
  }
}
