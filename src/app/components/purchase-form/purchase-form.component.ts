import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss'],
})
export class PurchaseFormComponent {
  purchaseForm: FormGroup;
  isModalOpen = false;


  constructor(private fb: FormBuilder, private firestore: Firestore) {
    this.purchaseForm = this.fb.group({
      supplierName: ['', Validators.required],
      products: this.fb.array([]),
    });
  }

  get products() {
    return this.purchaseForm.get('products') as FormArray;
  }

  addProduct() {
    const productGroup = this.fb.group({
      productName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      total: [{ value: 0, disabled: true }],
    });

    productGroup.get('quantity')?.valueChanges.subscribe(() => {
      this.updateTotal(productGroup);
    });

    productGroup.get('price')?.valueChanges.subscribe(() => {
      this.updateTotal(productGroup);
    });

    this.products.push(productGroup);
  }

  removeProduct(index: number) {
    this.products.removeAt(index);
  }

  updateTotal(group: FormGroup) {
    const quantity = group.get('quantity')?.value || 0;
    const price = group.get('price')?.value || 0;
    group.get('total')?.setValue(quantity * price, { emitEvent: false });
  }

  calculateTotalPrice(): number {
    return this.products.controls.reduce((total, group) => {
      const groupTotal = group.get('total')?.value || 0;
      return total + groupTotal;
    }, 0);
  }

  openModal() {
    if (this.purchaseForm.valid) {
      this.isModalOpen = true;
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async confirmPurchase() {
    const data = this.purchaseForm.getRawValue();
    data.createdAt = serverTimestamp();

    const purchasesCollection = collection(this.firestore, 'purchases');
    await addDoc(purchasesCollection, data);

    this.purchaseForm.reset();
    this.products.clear();
    this.isModalOpen = false;
  }
}

