<template>
  <q-page padding style="max-width: 1600px; margin: auto" class="page-background">
    <!-- Title -->
    <div class="text-h3 text-center text-blue font-weight-bold q-mb-md">
      Point of Sale
    </div>

    <div class="q-mt-md row">
      <!-- Left Side - Products List -->
      <div class="col-12 col-md-6" style="padding-right: 10px">
        <div class="row q-gutter-md">
          <div v-for="product in posStore.products" :key="product.id ?? 0" class="col-6 col-md-4">
            <ProductCard :product="product" @select="select" />
          </div>
        </div>
      </div>

      <!-- Right Side - Cart Summary -->
      <div class="col-12 col-md-6" style="padding-left: 10px">
        <q-scroll-area style="height: 500px">
          <table class="q-table q-table--dense">
            <thead>
              <tr class="bg-coffee text-white">
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Amount</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in posStore.productItems" :key="index">
                <td class="text-center">{{ index + 1 }}</td>
                <td>{{ item.product.name }}</td>
                <td class="text-center">{{ item.product.price }}</td>
                <td class="text-center">
                  <q-btn dense flat round icon="remove" @click="posStore.decrementAmount(item)" color="red" />
                  {{ item.amount }}
                  <q-btn dense flat round icon="add" @click="posStore.incrementAmount(item)" color="green" />
                </td>
                <td class="text-center">{{ item.product.price * item.amount }} ฿</td>
                <td class="text-center">
                  <q-btn dense flat icon="close" @click="posStore.removeItem(item)" color="red" />
                </td>
              </tr>
            </tbody>
          </table>
        </q-scroll-area>

        <div class="text-h5 text-right text-coffee font-weight-bold q-mt-md">
          Total: {{ posStore.sumPrice }} ฿
        </div>

        <div class="text-right q-mt-md">
          <q-btn color="primary" flat label="Create Order" @click="handleCreateOrder" class="q-mb-md" /> 
          <q-btn color="negative" flat label="Reset" @click="posStore.resetCart" class="q-mb-md" />
        </div>
      </div>
    </div>

    <!-- Dialog for Confirming Receipt Creation -->
    <q-dialog v-model="showReceiptDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Do you want to create a receipt for this order?</div>
        </q-card-section>

        <q-card-actions>
          <q-btn flat label="Cancel" @click="showReceiptDialog = false" />
          <q-btn flat label="Confirm" @click="confirmCreateReceipt" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ProductCard from 'src/components/ProductCard.vue';
import { usePosStore } from 'src/stores/posStore';
import type { Product } from 'src/models';

const posStore = usePosStore();
const showReceiptDialog = ref(false);

onMounted(async () => {
  await posStore.getProducts();
});

function select(product: Product) {
  posStore.addItem(product);
}

async function handleCreateOrder() {
  const orderCreated = await posStore.addOrder();
  if (orderCreated) {
    showReceiptDialog.value = true;  // Show dialog asking for receipt creation
  }
}

async function confirmCreateReceipt() {
  await posStore.createReceipt();  // Proceed to create receipt
  showReceiptDialog.value = false; // Close dialog after receipt creation
}
</script>

<style scoped>
.page-background {
  background-color: #f8f4f0; /* พื้นหลังสีครีมเพื่อให้ดูอบอุ่น */
}

.bg-coffee {
  background-color: #6f4f28; /* สีน้ำตาลกาแฟ */
}

.text-coffee {
  color: #6f4f28; /* ใช้สีที่เหมาะกับธีมกาแฟ */
}

.q-table th {
  font-size: 14px;
  text-transform: uppercase;
  font-weight: bold;
  background-color: #6f4f28;
}

.q-table td,
.q-table th {
  text-align: center;
}

.q-btn {
  padding: 8px 16px;
}

.font-weight-bold {
  font-weight: bold;
}

.q-card {
  width: 300px;
  max-width: 100%;
  background-color: #fff8f0; /* สีครีมสำหรับ Card */
}

.q-card-actions {
  padding: 10px;
}

.q-dialog {
  max-width: 350px;
}
</style>
