import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseFormComponent } from './components/purchase-form/purchase-form.component';
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';
import { ProductsComponent } from './components/products/products.component';
import { CustomerComponent } from './components/customer/customer.component';

const routes: Routes = [
  { path: '', component: PurchaseFormComponent },
  { path: 'lista', component: PurchaseListComponent },
  { path: 'produtos', component: ProductsComponent },
  { path: 'clientes', component: CustomerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
