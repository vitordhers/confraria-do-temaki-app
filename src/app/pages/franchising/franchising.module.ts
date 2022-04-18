import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FranchisingPageRoutingModule } from './franchising-routing.module';
import { FranchisingPage } from './franchising.page';
import { ComponentsModule } from '../../shared/components/components.module';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FranchisingPageRoutingModule,
    ComponentsModule,
    RecaptchaV3Module,
  ],
  declarations: [FranchisingPage],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.googleRecaptchaSiteKey,
    },
  ],
})
export class FranchisingPageModule {}
