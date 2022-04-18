import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCellphoneBr]',
})
export class CellphoneBrDirective {
  @Input() appCellphoneBr = false;
  @Input() phoneType!: 'celphone' | 'telephone';
  constructor(private el: ElementRef) {}

  @HostListener('ionChange', ['$event'])
  onModelChange(event: CustomEvent<{ value: string }>) {
    if (this.appCellphoneBr) {
      this.onInputChange(event.detail.value);
    }
  }

  onInputChange(event: any) {
    if (event) {
      let newVal = event.replace(/\D/g, '');
      if (newVal.length === 0) {
        newVal = '';
      } else if (newVal.length <= 2) {
        newVal = newVal.replace(/^(\d{0,2})/, '($1');
      } else if (newVal.length <= 3) {
        newVal = newVal.replace(/^(\d{0,2})/, '($1) ');
      } else if (newVal.length <= 4 && this.phoneType === 'celphone') {
        newVal = newVal.replace(/^(\d{0,2})(\d{0,1})/, '($1) $2 ');
      } else if (newVal.length <= 6 && this.phoneType === 'telephone') {
        newVal = newVal.replace(/^(\d{0,2})(\d{0,4})/, '($1) $2');
      } else if (newVal.length <= 7 && this.phoneType === 'celphone') {
        newVal = newVal.replace(/^(\d{0,2})(\d{0,1})(\d{0,4})/, '($1) $2 $3');
      } else if (newVal.length <= 10 && this.phoneType === 'telephone') {
        newVal = newVal.replace(/^(\d{0,2})(\d{0,4})(\d{0,4})/, '($1) $2-$3');
      } else {
        newVal = newVal.substring(0, 11);
        newVal = newVal.replace(
          /^(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})/,
          '($1) $2 $3-$4'
        );
      }
      this.el.nativeElement.value = newVal;
    }
  }
}
