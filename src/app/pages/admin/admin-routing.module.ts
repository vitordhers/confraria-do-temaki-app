import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from 'src/app/shared/guards/admin.guard';
import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    outlet: 'admin',
    data: {
      adminRoute: true,
    },
    children: [
      {
        path: 'produtos',
        loadChildren: () =>
          import('./products/products.module').then((m) => m.ProductsModule),
      },
      {
        path: 'mensagens',
        loadChildren: () =>
          import('./messages/messages.module').then((m) => m.MessagesModule),
        canActivate: [AdminGuard],
      },
      {
        path: 'unidades',
        loadChildren: () =>
          import('./units/units.module').then((m) => m.UnitsPageModule),
        canActivate: [AdminGuard],
      },
      {
        path: 'painel',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then(
            (m) => m.DashboardPageModule
          ),
        canActivate: [AdminGuard],
      },
      {
        path: 'franqueados',
        loadChildren: () =>
          import('./franchisees/franchisees.module').then(
            (m) => m.FranchiseesPageModule
          ),
        canActivate: [AdminGuard],
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./categories/categories.module').then(
            (m) => m.CategoriesPageModule
          ),
        canActivate: [AdminGuard],
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'painel',
      },
    ],
  },
  { path: '**', redirectTo: 'admin' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
