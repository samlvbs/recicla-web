import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { PurchaseFormComponent } from './components/purchase-form/purchase-form.component';
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';
import { environment } from '../environment/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProductsComponent } from './components/products/products.component';
import { CustomerComponent } from './components/customer/customer.component';

@NgModule({
  declarations: [
    AppComponent,
    PurchaseFormComponent,
    PurchaseListComponent,
    NavbarComponent,
    ProductsComponent,
    CustomerComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
  ],
  providers: [ provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // Configuração do Firebase App
    provideFirestore(() => getFirestore()), // Configuração do Firestore
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
