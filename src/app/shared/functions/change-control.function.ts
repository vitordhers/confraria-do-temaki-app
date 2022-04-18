import { FormGroup } from '@angular/forms';

export const changeControl = (form: FormGroup, control: string, value: any) => {
  form.get(control).markAsDirty();
  form.get(control).markAsTouched();
  form.get(control).patchValue(value);
  form.get(control).updateValueAndValidity();
};
