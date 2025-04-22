// src/stores/receiptStore.ts
import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import type { Receipt, ReceiptItem, Product } from "src/models";

export const useReceiptStore = defineStore('receipt', {
  state: () => ({
    receipts: [] as Receipt[],
  }),

  getters: {
    formattedReceipts: (state) => {
      return state.receipts.map((receipt) => ({
        ...receipt,
        totalAmount: receipt.items.reduce((sum, item) => {
          return sum + item.price * item.qty;
        }, 0),
      }));
    }
  },

  actions: {
    async fetchReceipts() {
      try {
        const response = await api.get('/receipts');
        console.log('📥 API Response:', response.data);

        if (!Array.isArray(response.data)) {
          throw new Error('❌ API response is not an array');
        }

        this.receipts = response.data.map((receipt: Receipt) => ({
          ...receipt,
          items: receipt.items ?? [],
        }));

        console.log('✅ Processed Receipts:', this.receipts);
      } catch (error) {
        console.error('❌ Fetch Receipts Error:', error);
      }
    },

    addReceipt(newReceipt: {
      createdAt: string;
      items: {
        price: number;
        qty: number;
        product: Product;
      }[];
    }) {
      const receiptItems: ReceiptItem[] = newReceipt.items.map((item, index) => {
        const total = item.price * item.qty;

        return {
          id: Date.now() + index, // จำลอง id ชั่วคราว
          name: item.product.name,
          price: item.price,
          qty: item.qty,
          total: total,
          product: item.product,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };
      });

      const totalAmount = receiptItems.reduce((sum, item) => sum + item.total, 0);

      this.receipts.push({
        id: Date.now(), // จำลอง ID
        qty: receiptItems.reduce((sum, item) => sum + item.qty, 0),
        totalAmount,
        createdAt: newReceipt.createdAt,
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        items: receiptItems,
      });
    },
  }
});
