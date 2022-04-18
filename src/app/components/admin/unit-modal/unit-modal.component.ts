import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UnitService } from 'src/app/services/unit.service';
import { atLeastOneRequiredValidator } from 'src/app/shared/functions/at-least-one-required-validator.function';
import { changeControl } from 'src/app/shared/functions/change-control.function';
import { fireError } from 'src/app/shared/functions/fire-error.function';
import { fireSuccess } from 'src/app/shared/functions/fire-success.function';
import { IUnit } from 'src/app/shared/interfaces/unit.interface';

@Component({
  selector: 'app-unit-modal',
  templateUrl: './unit-modal.component.html',
  styleUrls: ['./unit-modal.component.scss'],
})
export class UnitModalComponent implements OnInit {
  form: FormGroup;
  addWorkingHoursForm: FormGroup;
  editWorkingHoursForm: FormGroup;
  unit?: IUnit;
  center: google.maps.LatLngLiteral = { lat: -22.712736, lng: -47.646485 };
  loaders = { submit: false };

  changeControl = changeControl;

  constructor(
    private modalController: ModalController,
    private unitsService: UnitService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      id: new FormControl(null),
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]),
      location: new FormControl(null, [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]),
      address: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(200),
      ]),
      lat: new FormControl(-22.712736, [Validators.required]),
      lng: new FormControl(-47.646485, [Validators.required]),
      telephone: new FormControl(null, [
        Validators.required,
        Validators.minLength(14),
        Validators.maxLength(14),
      ]),
      whatsapp: new FormControl(null, [
        Validators.minLength(16),
        Validators.maxLength(16),
      ]),
      workingHours: new FormArray([], [atLeastOneRequiredValidator]),
    });

    if (this.unit) {
      this.form.patchValue({ ...this.unit });

      const control = this.form.get('workingHours') as FormArray;
      this.unit.workingHours.map((workingHour) => {
        const newControl = this.mapValueToFormControl(workingHour);
        control.push(newControl);
      });
    }
  }

  dragEnd(evt) {
    this.form.get('lat').patchValue(evt.latLng.lat());
    this.form.get('lng').patchValue(evt.latLng.lng());
  }

  dismiss() {
    this.modalController.dismiss();
  }

  mapValueToFormControl(value: any) {
    return new FormControl(value);
  }

  addWorkingHoursChip(value: string) {
    const formArray = this.form.get('workingHours') as FormArray;
    const control = this.mapValueToFormControl(value);
    formArray.push(control);
  }

  removeWorkingHoursChip(index: number) {
    const formArray = this.form.get('workingHours') as FormArray;
    formArray.removeAt(index);
  }

  submit() {
    if (this.form.valid) {
      const payload = this.form.value;
      const source$ = this.unit
        ? this.unitsService.updateUnit(payload)
        : this.unitsService.createUnit(payload);
      return source$.subscribe({
        next: (result) => {
          this.loaders.submit = false;
          if (result.success && result.payload) {
            fireSuccess(
              result.payload,
              'A Unidade',
              this.unit ? 'atualizada' : 'criada'
            );
            return this.modalController.dismiss();
          }
          fireError(payload, 'A Unidade', payload.id ? 'atualizada' : 'criada');
        },
        error: (err) => {
          this.loaders.submit = false;
          fireError(
            payload,
            'A Unidade',
            this.unit ? 'atualizada' : 'criada',
            err
          );
        },
      });
    }
    this.form.markAllAsTouched();
  }
}
