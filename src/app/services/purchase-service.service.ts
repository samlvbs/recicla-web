import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { collection, collectionData, query } from '@angular/fire/firestore';
import { Firestore,doc, deleteDoc } from 'firebase/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Torna o serviço disponível globalmente
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
        map((document: any) => document?.products || []) // Retorna o array de produtos ou vazio
      );
  }

  getAllProducts(): Observable<any[]> {
    return this.afs.collection('purchases').valueChanges().pipe(
      map((documents: any[]) =>
        documents.flatMap(doc => doc.products || []) // Combina os arrays de produtos
      )
    );
  }

  getAllPurchases(): Observable<any[]> {
    return this.afs.collection('purchases').snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const id = a.payload.doc.id; // ID do documento
          const data = a.payload.doc.data() as any; // Dados do documento
          return { id, ...data }; // Combina o ID com os dados
        })
      )
    );
  }

  convertTimestampToDate(timestamp: any): string {
    if (!timestamp || !timestamp.toDate) {
      return 'Data não disponível'; // Mensagem padrão ou outro tratamento
    }
    const date = timestamp.toDate(); // Converte o Timestamp do Firestore para uma instância de Date
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(); // Formata para data e hora legíveis
  }

  deletePurchase(id: string){
    return this.afs.doc(`purchases/${id}`).delete()// Deleta o documento
  }
}
