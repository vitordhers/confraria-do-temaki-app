import { FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';

export const atLeastOneRequiredValidator =
  (): ValidatorFn =>
  (control: FormArray): ValidationErrors | null => {
    const values = control.value;
    return !values.length ? { atLeastOneRequired: { value: true } } : null;
  };
