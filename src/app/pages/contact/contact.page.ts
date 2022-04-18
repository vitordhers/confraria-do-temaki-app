import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UnitService } from '../../services/unit.service';
import { Unit } from '../../shared/models/unit.model';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { MessagesService } from 'src/app/services/messages.service';
import { fireToast } from 'src/app/shared/functions/fire-toast.function';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  public form!: FormGroup;
  public unit$!: Observable<Unit>;
  submitLoader = false;

  constructor(
    public unitService: UnitService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private messagesService: MessagesService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]),
      email: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50),
        Validators.email,
      ]),
      message: new FormControl(null, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000),
      ]),
    });

    this.unit$ = combineLatest([
      this.unitService.currentUnitId$,
      this.unitService.units$,
    ]).pipe(
      map(([currentUnitId, units]) =>
        units.find((unit) => unit.id === currentUnitId)
      )
    );
  }

  changeControl(control: string, value: any) {
    this.form.get(control).markAsDirty();
    this.form.get(control).markAsTouched();
    this.form.get(control).patchValue(value);
    this.form.get(control).updateValueAndValidity();
  }

  submitForm() {
    console.log('submitForm', this.form.valid);
    if (this.form.valid) {
      this.recaptchaV3Service
        .execute('homepage')
        .pipe(
          tap((_) => {
            this.submitLoader = true;
          }),
          switchMap((recaptcha) => {
            if (recaptcha) {
              const formData = { ...this.form.value, recaptcha };
              return this.messagesService.submitContactForm(formData);
            }
            return EMPTY;
          })
        )
        .subscribe({
          next: (response) => {
            this.submitLoader = true;
            if (response.success) {
              return fireToast(
                'Muito obrigado!',
                'Agradecemos por sua mensagem!',
                'success'
              );
            }
            this.displayError();
          },
          error: (e) => {
            console.log(e);
            this.displayError();
          },
        });
    }
    this.form.markAllAsTouched();
  }

  displayError() {
    this.submitLoader = false;
    return fireToast(
      'Muito obrigado!',
      'Infelizmente não foi possível receber sua mensagem. Por gentileza, tente novamente mais tarde',
      'error'
    );
  }
}
