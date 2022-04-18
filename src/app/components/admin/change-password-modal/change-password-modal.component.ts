import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { EMPTY, switchMap, tap } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { equalsToValidator } from 'src/app/shared/functions/equals-to-validator.function';
import { fireError } from 'src/app/shared/functions/fire-error.function';
import { fireSuccess } from 'src/app/shared/functions/fire-success.function';
import { IUser } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
})
export class ChangePasswordModalComponent implements OnInit {
  @Input() franchisee: IUser;
  loaders = { submit: false };
  form: FormGroup;
  isPasswordShown = false;
  isConfirmPasswordShown = false;

  constructor(
    private userService: UserService,
    private modalController: ModalController,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {}

  ngOnInit() {
    this.form = new FormGroup(
      {
        password: new FormControl(null, [
          Validators.required,
          Validators.pattern(
            '^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$'
          ),
        ]),
        cPassword: new FormControl(null, [Validators.required]),
      },
      [equalsToValidator()]
    );
  }

  changeControl(control: string, value: any) {
    this.form.get(control).markAsDirty();
    this.form.get(control).markAsTouched();
    this.form.get(control).patchValue(value);
    this.form.get(control).updateValueAndValidity();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  submit() {
    if (this.form.valid) {
      const payload = { ...this.form.value };
      delete payload.cPassword;
      this.recaptchaV3Service
        .execute('login')
        .pipe(
          tap((_) => {
            this.loaders.submit = true;
          }),
          switchMap((recaptcha) => {
            if (recaptcha) {
              const formData = { ...payload, recaptcha };
              return this.userService.updateUserPassword(
                this.franchisee.id,
                formData
              );
            }
            return EMPTY;
          })
        )
        .subscribe({
          next: (result) => {
            this.loaders.submit = false;
            if (result.success) {
              fireSuccess(this.franchisee, 'A senha do usuário', 'atualizada');
              return this.modalController.dismiss();
            }
            fireError(this.franchisee, 'A senha do usuário', 'atualizada');
          },
          error: (err) => {
            this.loaders.submit = false;
            fireError(this.franchisee, 'A senha do usuário', 'atualizada', err);
          },
        });
    }
    this.form.markAllAsTouched();
  }
}
