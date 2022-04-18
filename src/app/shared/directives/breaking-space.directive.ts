import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appBreakingSpace]',
})
export class BreakingSpaceDirective {
  @Output() valueSubmit = new EventEmitter<string>();
  constructor(private el: ElementRef) {}

  @HostListener('window:keydown.enter', ['$event'])
  onModelChange(event: Event) {
    this.emitValue(event);
  }

  emitValue(event: any) {
    if (event) {
      this.valueSubmit.emit(event.target.value);
      event.target.value = null;
    }
  }
}
