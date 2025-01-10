import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collection, collectionData} from '@angular/fire/firestore';

import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {


  constructor(private afs: AngularFirestore) {}

  getPurchases(purchase: string): Observable<any[]> {
    const purchasesRef = collection(this.afs.firestore, purchase);
    return collectionData(purchasesRef, { idField: 'id' }).pipe(
      map((documents) => documents.map((document) => ({ ...document, id: document.id})))
    )
  }

  getCollectionWithQuery<T>(
    collectionName: string,
    field: string,
    value: any
  ): Observable<T[]> {
    return this.afs
      .collection<T>(collectionName, ref => ref.where(field, '==', value))
      .valueChanges();
  }

  getProducts(purchaseId: string): Observable<any[]> {
    return this.afs
      .doc(`purchases/${purchaseId}`)
      .valueChanges()
      .pipe(
        map((document: any) => document?.products || [])
      );
  }

  getAllProducts(): Observable<any[]> {
    return this.afs.collection('purchases').valueChanges().pipe(
      map((documents: any[]) =>
        documents.flatMap(doc => doc.products || [])
      )
    );
  }

  getAllPurchases(): Observable<any[]> {
    return this.afs.collection('purchases').snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const id = a.payload.doc.id;
          const data = a.payload.doc.data() as any;
          return { id, ...data };
        })
      )
    );
  }

  convertTimestampToDate(timestamp: any): string {
    if (!timestamp || !timestamp.toDate) {
      return 'Data não disponível';
    }
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  deletePurchase(id: string){
    return this.afs.doc(`purchases/${id}`).delete()
  }
}
