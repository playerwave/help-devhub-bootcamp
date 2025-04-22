<template>
  <h3 class="q-my-md text-center text-blue">Receipt</h3>

  <q-page padding class="receipt-page">

    <!-- ตัวกรองช่วงเวลา -->
    <div class="row q-gutter-md items-center q-mb-md">

      <!-- เลือกช่วงเวลา (วันที่เริ่มต้นและสิ้นสุด) -->
      <div class="q-gutter-md">
        <q-input
          v-model="startDate"
          :label="`เลือกวันที่เริ่มต้น`"
          dense outlined
          readonly
          class="cursor-pointer"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" />
          </template>

          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              v-model="startDate"
              :type="datePickerType"
              :mask="datePickerMask"
              @update:model-value="onStartDateSelected"
            />
          </q-popup-proxy>
        </q-input>

        <q-input
          v-model="endDate"
          :label="`เลือกวันที่สิ้นสุด`"
          dense outlined
          readonly
          class="cursor-pointer"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" />
          </template>

          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              v-model="endDate"
              :type="datePickerType"
              :mask="datePickerMask"
              @update:model-value="onEndDateSelected"
            />
          </q-popup-proxy>
        </q-input>
      </div>
    </div>

    <!-- ตารางใบเสร็จ -->
    <q-table :columns="columns" :rows="filteredReceipts">
      <template v-slot:body-cell-operation="props">
        <q-td :props="props">
          <q-btn
            outline
            color="primary"
            icon="visibility"
            label="View"
            @click="openReceiptDetails(props.row)"
            class="q-px-sm view-btn"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Receipt Modal -->
    <q-dialog v-model="isModalOpen">
      <q-card style="min-width: 450px; border-radius: 10px">
        <q-card-section
          class="text-center"
          style="background-color: #007bff; color: white; border-top-left-radius: 10px; border-top-right-radius: 10px;"
        >
          <h3 class="text-h5">Receipt Details</h3>
          <p>Store: D-Coffee</p>
          <p>Date/Time: {{ formatDateTime(selectedReceipt?.createdAt) }}</p>
          <p>Receipt No: #{{ selectedReceipt?.id }}</p>
        </q-card-section>

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

        <q-card-section
          class="text-center text-bold text-h6"
          style="background-color: #f7f7f7; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;"
        >
          Total: {{ formatCurrency(selectedReceipt?.totalAmount ?? 0) }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="isModalOpen = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { type QTableColumn } from "quasar";
import { useReceiptStore } from "src/stores/receiptStore";
import type { Receipt, ReceiptItem } from "src/models";

// ตารางคอลัมน์
const columns: QTableColumn[] = [
  { name: "id", label: "ID", field: "id", align: "center", sortable: true },
  {
    name: "createdAt",
    label: "Date/Time",
    field: "createdAt",
    align: "center",
    format: (val: string) => formatDateTime(val),
  },
  {
    name: "productName",
    label: "Product Name",
    field: "items",
    align: "center",
    format: (val: ReceiptItem[]) =>
      val.map((item) => item.product?.name ?? '-').join(", "),
  },
  {
    name: "qty",
    label: "Quantity",
    field: "items",
    align: "center",
    format: (val: ReceiptItem[]) =>
      String(val.reduce((sum, item) => sum + (item.qty || 0), 0)),
  },
  {
    name: "totalAmount",
    label: "Total (THB)",
    field: "totalAmount",
    align: "center",
  },
  {
    name: "operation",
    label: "",
    field: "operation",
    align: "center"
  }
];

// Store และ States
const receiptStore = useReceiptStore();
const selectedReceipt = ref<Receipt | null>(null);
const isModalOpen = ref(false);

// กรองช่วงเวลา
const startDate = ref<string>('');
const endDate = ref<string>('');

// กำหนด type/mask สำหรับ q-date
const datePickerType = computed(() => {
  return 'day'; // กำหนดเป็น type "day" เพื่อเลือกวัน
});

const datePickerMask = computed(() => {
  return 'YYYY-MM-DD'; // กำหนดเป็น mask วันที่แบบ "YYYY-MM-DD"
});

// ฟังก์ชันเมื่อเลือกวันที่เริ่มต้น
const onStartDateSelected = (val: string) => {
  startDate.value = val;
};

// ฟังก์ชันเมื่อเลือกวันที่สิ้นสุด
const onEndDateSelected = (val: string) => {
  endDate.value = val;
};

// ฟิลเตอร์ใบเสร็จตามช่วงวันที่ที่เลือก
const formattedReceipts = computed(() => receiptStore.formattedReceipts);

const filteredReceipts = computed(() => {
  if (!startDate.value || !endDate.value) return formattedReceipts.value;

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);

  return formattedReceipts.value.filter((receipt) => {
    const created = new Date(receipt.createdAt);
    return created >= start && created <= end;
  });
});

// ฟังก์ชันแสดง modal
const openReceiptDetails = (receipt: Receipt) => {
  selectedReceipt.value = receipt;
  isModalOpen.value = true;
};

// ฟอร์แมตราคา
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(value);
};

// ฟอร์แมตวันเวลา
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

// โหลดข้อมูล
onMounted(async () => {
  await receiptStore.fetchReceipts();
});
</script>

<style scoped>
.receipt-page {
  padding: 20px;
}

.receipt-item {
  background-color: #fafafa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.receipt-item q-item-label {
  font-weight: bold;
}

.receipt-item q-item-section {
  border-bottom: 1px solid #ddd;
}

.view-btn {
  font-size: 14px;
  border-radius: 12px;
  font-weight: 500;
  transition: 0.2s;
}

.view-btn:hover {
  background-color: #e3f2fd;
  color: #1976d2;
}
</style>
