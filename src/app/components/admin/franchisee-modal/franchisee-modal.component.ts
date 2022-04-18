import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { EMPTY, switchMap, tap } from 'rxjs';
import { UnitService } from 'src/app/services/unit.service';
import { UserService } from 'src/app/services/user.service';
import { UserRole } from 'src/app/shared/enums/user-role.enum';
import { atLeastOneRequiredValidator } from 'src/app/shared/functions/at-least-one-required-validator.function';
import { equalsToValidator } from 'src/app/shared/functions/equals-to-validator.function';
import { fireError } from 'src/app/shared/functions/fire-error.function';
import { fireSuccess } from 'src/app/shared/functions/fire-success.function';
import { IUser } from 'src/app/shared/interfaces/user.interface';

@Component({
  selector: 'app-franchisee-modal',
  templateUrl: './franchisee-modal.component.html',
  styleUrls: ['./franchisee-modal.component.scss'],
})
export class FranchiseeModalComponent implements OnInit {
  @Input() franchisee?: IUser;
  loaders = { submit: false };
  isPasswordShown = false;
  isConfirmPasswordShown = false;
  form: FormGroup;
  roleOptions = [
    { title: 'Administrador', value: UserRole.ADMIN },
    { title: 'Franqueado', value: UserRole.FRANCHISED },
  ];
  constructor(
    public unitService: UnitService,
    private userService: UserService,
    private modalController: ModalController,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {}

  get passwordsControl() {
    return this.form.get('passwords') as FormGroup;
  }

  ngOnInit() {
    this.form = new FormGroup({
      id: new FormControl(null, this.franchisee ? [Validators.required] : []),
      name: new FormControl(null, [
        Validators.required,
        Validators.maxLength(100),
        Validators.minLength(5),
      ]),
      surname: new FormControl(null, [
        Validators.required,
        Validators.maxLength(100),
        Validators.minLength(5),
      ]),
      email: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50),
        Validators.email,
      ]),
      role: new FormControl(UserRole.FRANCHISED, [Validators.required]),
      unitsOwnedIds: new FormArray([], [atLeastOneRequiredValidator()]),
      passwords: new FormGroup(
        {
          password: new FormControl(null, [
            Validators.required,
            Validators.pattern(
              '^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$'
            ),
          ]),
          cPassword: new FormControl(null, [Validators.required]),
        },
        this.franchisee ? [] : [equalsToValidator()]
      ),
    });

    if (this.franchisee) {
      this.form.get('passwords').disable();

      this.form.patchValue({ ...this.franchisee });

      if (this.franchisee.unitsOwnedIds?.length) {
        const unitIdsControl = this.getControlFormArray();
        this.franchisee.unitsOwnedIds.map((unitId) => {
          const control = this.mapValueToFormControl(unitId);
          unitIdsControl.push(control);
        });
      }
    }
  }

  changeControl(control: string, value: any) {
    this.form.get(control).markAsDirty();
    this.form.get(control).markAsTouched();
    this.form.get(control).patchValue(value);
    this.form.get(control).updateValueAndValidity();
  }

  changePasswordControl(control: string, value: any) {
    this.form.get('passwords').get(control).markAsDirty();
    this.form.get('passwords').get(control).markAsTouched();
    this.form.get('passwords').get(control).patchValue(value);
    this.form.get('passwords').get(control).updateValueAndValidity();
  }

  toggleChip(unitId: string) {
    const control = this.getControlFormArray();
    const index = (control.value as string[]).findIndex(
      (uId) => uId === unitId
    );
    if (index !== -1) {
      return control.removeAt(index);
    }
    const newControl = this.mapValueToFormControl(unitId);
    control.push(newControl);
  }

  getControlFormArray() {
    return this.form.get('unitsOwnedIds') as FormArray;
  }

  mapValueToFormControl(value: any) {
    return new FormControl(value);
  }

  submit() {
    if (this.form.valid) {
      const payload = { ...this.form.value };

      if (payload.passwords) {
        payload.password = payload.passwords.password;
        delete payload.passwords;
      }

      this.recaptchaV3Service
        .execute('login')
        .pipe(
          tap((_) => {
            this.loaders.submit = true;
          }),
          switchMap((recaptcha) => {
            if (recaptcha) {
              const formData = { ...payload, recaptcha };
              return this.franchisee
                ? this.userService.updateUser(formData)
                : this.userService.createUser(formData);
            }
            return EMPTY;
          })
        )
        .subscribe({
          next: (result) => {
            this.loaders.submit = false;
            if (result.success && result.payload) {
              fireSuccess(
                payload,
                'O Usuário',
                this.franchisee ? 'atualizado' : 'criado'
              );
              return this.modalController.dismiss();
            }
            fireError(
              payload,
              'O Usuário',
              payload.id ? 'atualizado' : 'criado'
            );
          },
          error: (err) => {
            this.loaders.submit = false;
            fireError(
              payload,
              'O Usuário',
              this.franchisee ? 'atualizado' : 'criado',
              err
            );
          },
        });
    }
    this.form.markAllAsTouched();
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
