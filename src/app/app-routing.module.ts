import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseFormComponent } from './components/purchase-form/purchase-form.component';
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';

const routes: Routes = [
  { path: '', component: PurchaseFormComponent },
  { path: 'lista', component: PurchaseListComponent },

  // Outras rotas podem ser adicionadas aqui
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
