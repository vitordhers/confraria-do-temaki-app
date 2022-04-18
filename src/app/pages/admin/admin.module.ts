import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../shared/components/components.module';
import { AdminPage } from './admin.page';
import { AdminPageRoutingModule } from './admin-routing.module';
import { AdminComponentsModule } from 'src/app/shared/components/admin-components.module';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';

registerLocaleData(ptBr);
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    AdminPageRoutingModule,
    ComponentsModule,
    AdminComponentsModule,
  ],
  declarations: [AdminPage],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
})
export class AdminPageModule {}
