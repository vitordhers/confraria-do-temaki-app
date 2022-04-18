import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MessagesPage } from './messages.component';

const routes: Routes = [
  {
    path: '',
    component: MessagesPage,
    data: {
      adminRoute: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagesRoutingModule {}
