import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Firestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss'],
})
export class PurchaseFormComponent {
  purchaseForm: FormGroup;
  isModalOpen = false;
  productsList: any[] = [];
  lastPurchase: any = null;

  constructor(private fb: FormBuilder, private firestore: Firestore) {
    this.purchaseForm = this.fb.group({
      supplierName: [''],
      products: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.fetchLastPurchase();  // Busca a última compra ao inicializar o componente
    this.fetchProducts(); // Busca a lista de produtos ao inicializar o componente

  }

  get products() {
    return this.purchaseForm.get('products') as FormArray;
  }

  async fetchProducts() {
    try {
      const productsCollection = collection(this.firestore, 'products'); // Obtém referência à coleção
      const querySnapshot = await getDocs(productsCollection); // Busca os documentos na coleção
      this.productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Mapeia os dados para um formato de objeto
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  }

  async fetchLastPurchase() {
    try {
      const purchasesCollection = collection(this.firestore, 'purchases');

      // Consulta para buscar o último documento com base no campo createdAt
      const purchasesQuery = query(purchasesCollection, orderBy('createdAt', 'desc'), limit(1));
      const querySnapshot = await getDocs(purchasesQuery);

      if (!querySnapshot.empty) {
        const lastPurchaseDoc = querySnapshot.docs[0];
        const data = lastPurchaseDoc.data();

        // Calcula o total da compra com base nos produtos
        const total = (data['products'] || []).reduce((sum: number, product: any) => {
          const quantity = product.quantity || 0;
          const price = product.price || 0;
          return sum + quantity * price;
        }, 0);

        // Atualiza a última compra com o total calculado
        this.lastPurchase = {
          id: lastPurchaseDoc.id,
          ...data,
          createdAt: (data['createdAt'] as Timestamp).toDate(),
          total: parseFloat(total.toFixed(2)), // Formata com 2 casas decimais
        };
      }
    } catch (error) {
      console.error('Erro ao buscar última compra:', error);
    }
  }

  addProduct() {
    const productGroup = this.fb.group({
      productName: ['', Validators.required],
      quantity: [[Validators.required, Validators.min(0)]],
      price: [{ value: 0}],
      total: [{ value: 0, disabled: true }],
    });

    productGroup.get('productName')?.valueChanges.subscribe((productName) => {
      this.updatePriceAndTotal(productGroup, productName);
    });

    productGroup.get('quantity')?.valueChanges.subscribe(() => {
      this.updateTotal(productGroup);
    });

    this.products.push(productGroup);
  }

  removeProduct(index: number) {
    this.products.removeAt(index);
  }

  updatePriceAndTotal(group: FormGroup, productName: string | null) {
    const selectedProduct = this.productsList.find((p) => p.name === productName);
    if (selectedProduct) {
      group.get('price')?.setValue(selectedProduct.purchasePrice, { emitEvent: false });
      this.updateTotal(group);
    }
  }

  updateTotal(group: FormGroup) {
    const quantity = group.get('quantity')?.value || 0;
    const price = group.get('price')?.value || 0;
    const total = (quantity * price).toFixed(2);
    group.get('total')?.setValue(parseFloat(total), { emitEvent: false });
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
    const docRef = await addDoc(purchasesCollection, data);

    // Atualize a última compra
    this.lastPurchase = { ...data, id: docRef.id };

    this.purchaseForm.reset();
    this.products.clear();
    this.isModalOpen = false;
  }
}

