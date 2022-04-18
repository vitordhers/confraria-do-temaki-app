import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { EMPTY, switchMap, tap } from 'rxjs';
import { MessagesService } from '../../services/messages.service';
import { InvestmentRange } from '../../shared/enums/investment-range.enum';
import { fireToast } from '../../shared/functions/fire-toast.function';

@Component({
  selector: 'app-franchising',
  templateUrl: './franchising.page.html',
  styleUrls: ['./franchising.page.scss'],
})
export class FranchisingPage implements OnInit {
  stateOptions = [
    { value: 'AC', title: 'Acre' },
    { value: 'AL', title: 'Alagoas' },
    { value: 'AP', title: 'Amapá' },
    { value: 'AM', title: 'Amazonas' },
    { value: 'BA', title: 'Bahia' },
    { value: 'CE', title: 'Ceará' },
    { value: 'ES', title: 'Espírito Santo' },
    { value: 'GO', title: 'Goiás' },
    { value: 'MA', title: 'Maranhão' },
    { value: 'MT', title: 'Mato Grosso' },
    { value: 'MS', title: 'Mato Grosso do Sul' },
    { value: 'MG', title: 'Minas Gerais' },
    { value: 'PA', title: 'Pará' },
    { value: 'PB', title: 'Paraíba' },
    { value: 'PR', title: 'Paraná' },
    { value: 'PE', title: 'Pernambuco' },
    { value: 'PI', title: 'Piauí' },
    { value: 'RJ', title: 'Rio de Janeiro' },
    { value: 'RN', title: 'Rio Grande do Norte' },
    { value: 'RS', title: 'Rio Grande do Sul' },
    { value: 'RO', title: 'Rondônia' },
    { value: 'RR', title: 'Roraima' },
    { value: 'SC', title: 'Santa Catarina' },
    { value: 'SP', title: 'São Paulo' },
    { value: 'SE', title: 'Sergipe' },
    { value: 'TO', title: 'Tocantins' },
    { value: 'DF', title: 'Distrito Federal' },
  ];
  submitLoader = false;

  initialValueInvestment = InvestmentRange.MIDLOW;

  investmentOptions = [
    { value: InvestmentRange.LOW, title: InvestmentRange.LOW },
    { value: InvestmentRange.MIDLOW, title: InvestmentRange.MIDLOW },
    { value: InvestmentRange.MID, title: InvestmentRange.MID },
    { value: InvestmentRange.MIDHIGH, title: InvestmentRange.MIDHIGH },
    { value: InvestmentRange.HIGH, title: InvestmentRange.HIGH },
  ];

  public form: FormGroup;

  constructor(
    private messagesService: MessagesService,
    private recaptchaV3Service: ReCaptchaV3Service
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
      celphone: new FormControl(null, [
        Validators.required,
        Validators.minLength(16),
        Validators.maxLength(16),
      ]),
      telephone: new FormControl(null, [
        Validators.required,
        Validators.minLength(14),
        Validators.maxLength(14),
      ]),
      state: new FormControl('SP', [Validators.required]),
      city: new FormControl(null, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
      reference: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ]),
      investment: new FormControl(InvestmentRange.MIDLOW, [
        Validators.required,
      ]),
      message: new FormControl(null, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000),
      ]),
    });
  }

  changeControl(control: string, value: any) {
    this.form.get(control).markAsDirty();
    this.form.get(control).markAsTouched();
    this.form.get(control).patchValue(value);
    this.form.get(control).updateValueAndValidity();
  }

  submitForm() {
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
              return this.messagesService.submitFranchisingForm(formData);
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
                'Agradecemos seu interesse na nossa Franquia. Em breve entraremos em contato',
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
      'Infelizmente não foi possível registrar seu interesse. Por gentileza, tente novamente mais tarde',
      'error'
    );
  }
}
