import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseService } from '../../services/purchase-service.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  productForm: FormGroup;
  products: any[] = [];

  constructor(private fb: FormBuilder, private purchaseService: PurchaseService) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.required, Validators.min(0)]],
      profit: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    });
    this.productForm.get('purchasePrice')?.valueChanges.subscribe(() => this.calculateProfit());
    this.productForm.get('salePrice')?.valueChanges.subscribe(() => this.calculateProfit());
  }

  ngOnInit() {
    this.loadProducts();
  }

  // Carregar os produtos existentes no Firebase
  loadProducts() {
    this.purchaseService.getAllProducts().subscribe((data) => {
      this.products = data;
    });
  }

  calculateProfit() {
    const purchasePrice = this.productForm.get('purchasePrice')?.value || 0;
    const salePrice = this.productForm.get('salePrice')?.value || 0;
    const profit = parseFloat((salePrice - purchasePrice).toFixed(2)); 
    this.productForm.get('profit')?.setValue(profit, { emitEvent: false });
  }

  // Adicionar um novo produto ao Firebase
  addProduct() {
    if (this.productForm.valid) {
      const product = this.productForm.value;
      this.purchaseService.addProduct(product).then(() => {
        alert('Produto cadastrado com sucesso!');
        this.productForm.reset();
        this.loadProducts(); // Atualiza a lista de produtos
      });
    }
  }
}
