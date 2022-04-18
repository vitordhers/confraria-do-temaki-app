import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { ComponentsModule } from './components.module';
import { LeadModalComponent } from '../../components/admin/lead-modal/lead-modal.component';
import { MessageModalComponent } from '../../components/admin/message-modal/message-modal.component';
import { AddModalComponent } from '../../components/admin/add-modal/add-modal.component';
import { EditModalComponent } from '../../components/admin/edit-modal/edit-modal.component';
import { FranchiseeModalComponent } from '../../components/admin/franchisee-modal/franchisee-modal.component';
import { ChangePasswordModalComponent } from '../../components/admin/change-password-modal/change-password-modal.component';
import { UnitModalComponent } from '../../components/admin/unit-modal/unit-modal.component';
import { CategoryModalComponent } from 'src/app/components/admin/category-modal/category-modal.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    ReactiveFormsModule,
    ComponentsModule,
    GoogleMapsModule,
  ],
  declarations: [
    EditModalComponent,
    AddModalComponent,
    LeadModalComponent,
    MessageModalComponent,
    FranchiseeModalComponent,
    ChangePasswordModalComponent,
    UnitModalComponent,
    CategoryModalComponent,
  ],
  exports: [
    EditModalComponent,
    AddModalComponent,
    LeadModalComponent,
    MessageModalComponent,
    FranchiseeModalComponent,
    ChangePasswordModalComponent,
    UnitModalComponent,
    CategoryModalComponent,
  ],
})
export class AdminComponentsModule {}
