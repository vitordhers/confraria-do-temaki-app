import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FranchiseesPageRoutingModule } from './franchisees-routing.module';

import { FranchiseesPage } from './franchisees.page';
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { AdminComponentsModule } from 'src/app/shared/components/admin-components.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FranchiseesPageRoutingModule,
    AdminComponentsModule,
    RecaptchaV3Module,
  ],
  declarations: [FranchiseesPage],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.googleRecaptchaSiteKey,
    },
  ],
})
export class FranchiseesPageModule {}
