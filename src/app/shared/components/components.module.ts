import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DisplayProductComponent } from '../../components/display-product/display-product.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { environment } from 'src/environments/environment';
import { InputComponent } from 'src/app/components/input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MapComponent } from 'src/app/components/map/map.component';
import { ScrollTriggerComponent } from 'src/app/components/scroll-trigger/scroll-trigger.component';
import { ProductDetailComponent } from 'src/app/components/product-detail/product-detail.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { CellphoneBrDirective } from '../directives/phone.directive';
import { BreakingSpaceDirective } from '../directives/breaking-space.directive';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { LettersAndDashesDirective } from '../directives/only-letters-and-dash.directive';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    ReactiveFormsModule,
    GoogleMapsModule,
  ],
  declarations: [
    HeaderComponent,
    DisplayProductComponent,
    GalleryComponent,
    FooterComponent,
    InputComponent,
    MapComponent,
    ScrollTriggerComponent,
    ProductDetailComponent,
    CellphoneBrDirective,
    BreakingSpaceDirective,
    LettersAndDashesDirective,
  ],
  exports: [
    HeaderComponent,
    DisplayProductComponent,
    GalleryComponent,
    FooterComponent,
    InputComponent,
    MapComponent,
    ScrollTriggerComponent,
    ProductDetailComponent,
    CellphoneBrDirective,
    BreakingSpaceDirective,
    LettersAndDashesDirective,
  ],
})
export class ComponentsModule {}
