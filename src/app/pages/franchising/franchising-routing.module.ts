import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FranchisingPage } from './franchising.page';

const routes: Routes = [
  {
    path: '',
    component: FranchisingPage,
    data: {
      headerTrigger: 'franchisingTrigger',
      adminRoute: false,
      showRecaptcha: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FranchisingPageRoutingModule {}
