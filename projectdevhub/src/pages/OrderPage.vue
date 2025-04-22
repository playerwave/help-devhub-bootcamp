<template>
  <h3 class="q-my-md text-center text-blue">Order</h3>
  <q-page padding>
    <q-table 
      :columns="columns" 
      :rows="orderStore.formattedOrders" 
      row-key="id"
      :rows-per-page-options="[5, 10, 15]" 
      :pagination="pagination"
      class="my-table"
    />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { type QTableColumn } from 'quasar'
import { useOrderStore } from 'src/stores/orderStore'

const columns: QTableColumn[] = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'center',
    sortable: true,
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'center',
  },
  {
    name: 'qty',
    label: 'Quantity',
    field: 'qty',
    align: 'center',
  },
  {
    name: 'userId',
    label: 'User ID',
    field: 'userId',
    align: 'center',
  },
  {
    name: 'createdAt',
    label: 'Date/Time',
    field: 'createdAt',
    align: 'center',
    format: (val: string) => formatDateTime(val),
  }
]

const orderStore = useOrderStore()
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
})

onMounted(async () => {
  await orderStore.getOrders()
  pagination.value.rowsNumber = orderStore.formattedOrders.length
})

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}
</script>

<style scoped>
.my-table {
  background-color: #f9f9f9; /* สีพื้นหลังตาราง */
  border-radius: 8px; /* มุมโค้ง */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* เงา */
  padding: 20px;
}

.q-table th {
  background-color: #3e2723; /* สีน้ำตาลเข้ม */
  color: #fff; /* ข้อความในหัวตารางเป็นสีขาว */
  font-weight: bold;
  font-size: 14px;
}

.q-table td {
  color: #333; /* ข้อความในตารางสีเทาเข้ม */
  font-size: 14px;
}

.q-table .q-tr:nth-child(even) {
  background-color: #f1f1f1; /* แถวที่คู่พื้นหลังอ่อน */
}

.q-table .q-tr:nth-child(odd) {
  background-color: #ffffff; /* แถวที่คี่พื้นหลังขาว */
}

.q-table .q-td {
  padding: 10px;
}

.q-btn {
  font-size: 14px;
}
</style>
