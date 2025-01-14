import { Component, inject, OnInit } from '@angular/core';
import { PurchaseService } from '../../services/purchase-service.service';
import { DatePipe } from '@angular/common';

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
  providers: [DatePipe],
})
export class PurchaseListComponent implements OnInit {
  private readonly purchaseService_ = inject(PurchaseService);
  products: any[] = [];
  purchases: any[] = [];
  filteredPurchases: any[] = [];
  totalSum: number = 0;
  showDeleteModal: boolean = false;
  purchaseToDelete: Purchase | null = null;

  startDate: Date | null = null;
  endDate: Date | null = null;


  constructor(private purchaseService: PurchaseService, private datePipe: DatePipe) {}

  ngOnInit() {
    this.purchaseService.getAllPurchases().subscribe(data => {
      this.purchases = data.map(purchase => ({
        ...purchase,
        createdAt: this.purchaseService.convertTimestampToDate(purchase.createdAt),
      }));
      this.filterPurchasesByDate();
      this.calculateTotalSum()
      this.calculateTotalPurchase()
    });
  }

  filterPurchasesByDate() {
    if (this.startDate && this.endDate) {
      // Ajusta as datas selecionadas
      const normalizedStartDate = new Date(this.startDate);
      normalizedStartDate.setDate(normalizedStartDate.getDate() + 1); // Reduz um dia no início
      normalizedStartDate.setHours(0, 0, 0, 0); // Ajusta para o início do dia

      const normalizedEndDate = new Date(this.endDate);
      normalizedEndDate.setDate(normalizedEndDate.getDate() + 1); // Adiciona um dia no final
      normalizedEndDate.setHours(23, 59, 59, 999); // Ajusta para o final do dia

      this.filteredPurchases = this.purchases.filter((purchase) => {
        const purchaseDate = new Date(purchase.createdAt);

        return purchaseDate >= normalizedStartDate && purchaseDate <= normalizedEndDate;
      });
    } else {
      // Caso não haja filtro, exibe todas as compras
      this.filteredPurchases = [];
    }
    this.calculateFilteredTotalSum();
  }

  calculateFilteredTotalSum() {
    this.totalSum = this.filteredPurchases.reduce((sum: number, purchase: Purchase) => {
      const purchaseTotal = purchase.products.reduce((productSum, product) => productSum + product.total, 0);
      return sum + purchaseTotal;
    }, 0);
    this.totalSum = parseFloat(this.totalSum.toFixed(2));
  }

  calculateTotalPurchase() {
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
