import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FranchiseesPage } from './franchisees.page';

const routes: Routes = [
  {
    path: '',
    component: FranchiseesPage,
    data: {
      showRecaptcha: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FranchiseesPageRoutingModule {}
