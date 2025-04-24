<template>
  <q-page padding style="max-width: 1600px; margin: auto" class="page-background">
    <div class="text-h3 text-center text-blue font-weight-bold q-mb-md">
      Point of Sale
    </div>

    <!-- 🎉 แสดงลูกค้า -->
    <q-banner
      v-if="isGuest"
      class="bg-brown-1 text-brown-10 q-my-sm q-pa-sm"
      dense
    >
      👤 ลูกค้าทั่วไป
    </q-banner>

    <!-- แสดงข้อมูลลูกค้าที่เลือก -->
    <q-banner v-if="selectedCustomer" class="bg-indigo-1 text-indigo-10 q-my-sm q-pa-sm" dense>
      <div>👤 ลูกค้าที่เลือก: {{ selectedCustomer.name }} ({{ selectedCustomer.phone }})</div>
    </q-banner>

    <q-btn
      v-if="selectedCustomer && selectedCustomer.points >= 10"
      color="green"
      outline
      icon="redeem"
      label="ใช้แต้มแลกฟรี 1 แก้ว"
      @click="usePoints = !usePoints"
      class="q-my-sm"
    />

    <q-banner v-if="usePoints" class="bg-green-1 text-green-10 q-mb-sm" dense>
      ✅ จะใช้แต้มแลกฟรี 1 แก้วในการสั่งซื้อ กรุณาเลือกสินค้าที่ต้องการแลกฟรีด้วยปุ่ม "ฟรี"
    </q-banner>

    <div class="q-mt-md row">
      <!-- สินค้า -->
      <div class="col-12 col-md-6" style="padding-right: 10px">
        <div class="row q-gutter-md">
          <div
            v-for="product in posStore.products"
            :key="product.id ?? 0"
            class="col-6 col-md-4"
          >
            <ProductCard
              :product="product"
              @select="select"
              @selectFree="selectFreeProduct"
            />
          </div>
        </div>
      </div>

      <!-- ฝั่งขวา -->
      <div class="col-12 col-md-6" style="padding-left: 10px">
        <!-- ค้นหาลูกค้า -->
        <q-input
          filled
          v-model="searchName"
          label="🔍 ค้นหาชื่อลูกค้า..."
          dense
          clearable
          class="q-mb-sm"
        />

        <q-input
          filled
          v-model="searchPhone"
          label="🔍 ค้นหาเบอร์โทร..."
          dense
          clearable
          class="q-mb-sm"
        />

        <q-btn label="ค้นหา" color="primary" @click="filterCustomers" class="q-mb-md" />

        <q-list bordered separator v-if="filteredCustomers.length > 0">
          <q-item
            v-for="customer in filteredCustomers"
            :key="customer.id"
            clickable
            @click="selectCustomer(customer)"
          >
            <q-item-section>
              <q-item-label>{{ customer.name }}</q-item-label>
              <q-item-label caption>{{ customer.phone }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- ตะกร้าสินค้า -->
        <q-scroll-area style="height: 400px">
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

    <!-- Dialog ยืนยันสร้างใบเสร็จ -->
    <q-dialog v-model="isModalOpen">
      <q-card style="min-width: 450px; border-radius: 10px">
        <!-- Header -->
        <q-card-section
          class="text-center"
          style="background-color: #007bff; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px;"
        >
          <h3 class="text-h5">รายละเอียดใบเสร็จ</h3>
          <p>ร้าน: D-Coffee</p>
          <p>วันที่/เวลา: {{ formatDateTime(selectedReceipt?.createdAt) }}</p>
          <p>เลขที่ใบเสร็จ: #{{ selectedReceipt?.id }}</p>
          <p><strong>Name:</strong> {{ selectedReceipt?.customer?.name || 'ลูกค้าทั่วไป' }}</p>
          <p><strong>Phone:</strong> {{ selectedReceipt?.customer?.phone || '-' }}</p>
        </q-card-section>

        <!-- รายการสินค้า -->
        <q-card-section>
          <q-list bordered separator>
            <q-item
              v-for="item in selectedReceipt?.items || []"
              :key="item.id"
              class="receipt-item"
            >
              <q-item-section>
                <q-item-label class="text-h6">{{ item.product.name }}</q-item-label>
                <q-item-label caption>
                  {{ item.qty }} x {{ formatCurrency(item.price ?? 0) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-h6">
                  {{ formatCurrency((item.price ?? 0) * item.qty) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <!-- Total -->
        <q-card-section
          class="text-center text-bold text-h6"
          style="background-color: #f7f7f7; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;"
        >
          รวมทั้งหมด: {{ formatCurrency(selectedReceipt?.totalAmount ?? 0) }}
        </q-card-section>

        <!-- Footer Actions -->
        <q-card-actions align="right">
          <q-btn flat icon="close" label="ยกเลิก" color="negative" @click="isModalOpen = false" />
          <q-btn flat icon="check" label="ยืนยัน" color="primary" @click="handleReceiptConfirmed" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, provide } from 'vue';
import ProductCard from 'src/components/ProductCard.vue';
import { usePosStore } from 'src/stores/posStore';
import { useCustomerStore } from 'src/stores/customerStore';
import type { Product, Customer } from 'src/models';
import { Notify } from 'quasar';
import type { Receipt } from 'src/models';

const posStore = usePosStore();
const customerStore = useCustomerStore();
const isModalOpen = ref(false);
const selectedReceipt = ref<Receipt | null>(null);
const searchName = ref('');
const searchPhone = ref('');
const filteredCustomers = ref<Customer[]>([]);
const usePoints = ref(false);
const freeProductId = ref<number | undefined>(undefined);
const isGuest = ref(true); // ลูกค้าทั่วไป

provide('usePoints', usePoints);

const selectedCustomer = computed(() => customerStore.selectedCustomer);

function handleReceiptConfirmed() {
  isModalOpen.value = false;
  posStore.resetCart(); // เคลียร์ตะกร้าหลังยืนยัน
  Notify.create({
    message: 'ยืนยันใบเสร็จเรียบร้อยแล้ว',
    type: 'positive',
    icon: 'check_circle',
    position: 'top',
  });
}

function formatDateTime(dateTime: string | undefined): string {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleString('th-TH', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatCurrency(val: number): string {
  return `${val.toFixed(2)} ฿`;
}

onMounted(async () => {
  await posStore.getProducts();
  customerStore.selectedCustomer = null; // ไม่เลือกลูกค้าตั้งแต่เริ่ม
});

function select(product: Product) {
  posStore.addItem(product);
}

function selectFreeProduct(product: Product) {
  const freeProduct = { ...product, price: 0 };
  posStore.addItem(freeProduct);
  freeProductId.value = product.id;
  alert(`คุณเลือกสินค้า '${product.name}' เพื่อแลกฟรีด้วยแต้มแล้ว`);
}

function filterCustomers() {
  const nameKeyword = searchName.value.trim().toLowerCase();
  const phoneKeyword = searchPhone.value.trim();
  filteredCustomers.value = customerStore.customers.filter((c) => {
    const nameMatch = nameKeyword ? c.name.toLowerCase().includes(nameKeyword) : true;
    const phoneMatch = phoneKeyword ? c.phone.includes(phoneKeyword) : true;
    return nameMatch && phoneMatch;
  });
}

async function selectCustomer(customer: Customer) {
  await customerStore.selectCustomer(customer.id);
  searchName.value = customer.name;
  searchPhone.value = customer.phone;
  filteredCustomers.value = [];
}

async function handleCreateOrder() {
  if (!selectedCustomer.value && !isGuest.value) {
    alert('กรุณาเลือกลูกค้าก่อนทำรายการ');
    return;
  }

  const orderCreated = await posStore.addOrder(
    selectedCustomer.value?.id ?? 0,
    usePoints.value,
    freeProductId.value ?? null
  );

  if (orderCreated) {
    const receipt = await posStore.createReceipt();
    isModalOpen.value = true;
    selectedReceipt.value = {
      ...receipt,
      customer: selectedCustomer.value ?? { id: 0, name: 'ลูกค้าทั่วไป', phone: '-', email: '', points: 0 }, // กำหนด `id`, `email`, `points` ให้ครบถ้วน
    };
    usePoints.value = false;
    freeProductId.value = undefined;
  }
}
</script>

<style scoped>
.page-background {
  background-color: #f8f4f0;
}
.bg-coffee {
  background-color: #6f4f28;
}
.text-coffee {
  color: #6f4f28;
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
  background-color: #fff8f0;
}
.q-card-actions {
  padding: 10px;
}
.q-dialog {
  max-width: 350px;
}
</style>
