import { Component, inject, OnInit } from '@angular/core';
import { PurchaseService } from '../../services/purchase-service.service';

interface Product {
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Purchase {
  supplierName: string;
  createdAt: any;
  products: Product[];
  id: string;
}

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss'],
})
export class PurchaseListComponent implements OnInit {
  private readonly purchaseService_ = inject(PurchaseService);
  products: any[] = [];
  purchases: any[] = [];
  totalSum: number = 0;
  showDeleteModal: boolean = false;
  purchaseToDelete: Purchase | null = null;

  constructor(private purchaseService: PurchaseService) {
  }

  ngOnInit() {
    this.purchaseService.getAllPurchases().subscribe(data => {
      this.purchases = data.map(purchase => ({
        ...purchase,
        createdAt: this.purchaseService.convertTimestampToDate(purchase.createdAt),
      }));
      this.calculateTotalSum()
      this.calculateTotalPurhcase()
      console.log('Todas as Compras:', this.purchases);
    });
  }

  calculateTotalPurhcase() {
    this.purchases.forEach(purchase => {
      purchase.totalSum = purchase.products.reduce((productSum: number, product: Product) => productSum + product.total, 0);
    });
  }

  calculateTotalSum() {
    this.totalSum = this.purchases.reduce((sum: number, purchase: Purchase) => {
      const purchaseTotal = purchase.products.reduce((productSum, product) => productSum + product.total, 0);
      return sum + purchaseTotal;
    }, 0);
    this.totalSum = parseFloat(this.totalSum.toFixed(2));
  }

  openDeleteModal(purchase: Purchase) {
    this.purchaseToDelete = purchase;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.purchaseToDelete = null;
  }

  deletePurchase(id: string) {
    if (confirm('Tem certeza que deseja excluir esta compra?')) {
      this.purchaseService.deletePurchase(id).then(() => {

        this.purchases = this.purchases.filter((purchase) => purchase.id !== id);
        alert('Compra excluída com sucesso!');
      }).catch((error) => {
        console.error('Erro ao excluir compra: ', error);
        alert('Erro ao excluir a compra.');
      });
    }
  }

}
