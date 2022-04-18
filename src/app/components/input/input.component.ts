import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit {
  @Input() name!: string;
  @Input() type: 'text' | 'select' | 'textarea' | 'tel' | 'password' | 'number' = 'text';
  @Input() phoneType?: 'celphone' | 'telephone';
  @Input() placeholder?: string = '';
  @Input() label?: string;
  @Input() options?: { title: string; value: any }[] | null;
  @Input() maxlength?: number;
  @Input() initialValue?: any;
  @Input() isPhone = false;
  @Input() lettersAndDashes = false;
  @Input() min: number;
  @Input() max: number;

  @Output() value: EventEmitter<string> = new EventEmitter(undefined);

  toggleFilled = false;

  interfaceOptions = {
    cssClass: 'input-select',
  };

  constructor() {}

  ngOnInit() {
    if (this.initialValue !== null && this.initialValue !== undefined) {
      this.toggleFilled = true;
    }
  }

  onValueChange(e: Event) {
    const evt = e as CustomEvent<{ value: any }>;
    this.toggleFilled = evt.detail.value !== '' ? true : false;
    this.value.emit(evt.detail.value);
  }
}
