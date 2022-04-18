import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../../shared/components/components.module';
import { MessagesPage } from './messages.component';
import { MessagesRoutingModule } from './messages-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    MessagesRoutingModule,
    ComponentsModule,
  ],
  declarations: [MessagesPage],
})
export class MessagesModule {}
