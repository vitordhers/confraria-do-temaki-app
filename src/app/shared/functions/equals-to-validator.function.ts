import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const equalsToValidator =
  (): ValidatorFn =>
  (control: FormGroup): ValidationErrors | null => {
    const values = control.value;
    return values.password !== values.cPassword
      ? { equalsTo: { value: true } }
      : null;
  };
