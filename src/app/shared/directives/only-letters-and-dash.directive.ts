import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appLettersAndDashes]',
})
export class LettersAndDashesDirective {
  @Input() appLettersAndDashes = false;

  constructor(private el: ElementRef) {}

  @HostListener('ionChange', ['$event'])
  onModelChange(event: CustomEvent<{ value: string }>) {
    if (this.appLettersAndDashes) {
      this.onInputChange(event.detail.value);
    }
  }

  onInputChange(value: string) {
    if (value) {
      const newVal = value.replace(
        /[0-9!@#$%^&*()_+=\[\]{};':"\\|,.<>\/? ]*$/g,
        ''
      );

      this.el.nativeElement.value = newVal;
    }
  }
}
