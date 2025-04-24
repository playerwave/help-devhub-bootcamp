<template>
  <h3 class="q-my-md text-center text-blue">Product List</h3>
  <q-page padding>
    <div class="row justify-end">
      <q-btn icon="add" flat label="Add Product" @click="dialog = true" />
      <q-btn flat label="COUNT" @click="callgetPriceRangedialog" class="bg-coffee text-white" />
      <q-btn flat label="AddbyPCD" @click="callgetaddproductbypcd()" class="bg-coffee text-white" />
      <!-- ✅ ส่วนค้นหาสินค้าผ่าน Stored Procedure -->
      <div class="row q-col-gutter-md q-my-md">
        <q-input
          filled
          v-model.number="searchTypeId"
          label="ใส่เลขประเภทสินค้า (เช่น 1 หรือ 2)"
          type="number"
          style="width: 200px"
        />
        <q-input
          filled
          v-model.number="searchPrice"
          label="ราคามากกว่า"
          type="number"
          style="width: 200px"
        />
        <q-btn label="ค้นหาสินค้า" color="primary" @click="searchByTypeAndPrice" />
      </div>
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 350px" class="my-card">
        <div class="text-h6">{{ id === 0 ? 'Add New Product' : 'Edit Product' }}</div>

        <q-card-section class="q-pt-none">
          <q-form ref="form" @submit="save" @reset="onReset" class="q-gutter-md">
            <q-input
              filled
              v-model="name"
              label="Name"
              hint="Name Product"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Please enter name product']"
            />
            <q-input
              filled
              v-model.number="price"
              label="Price"
              hint="Price Product"
              lazy-rules
              :rules="[
                (val) =>
                  (typeof val === 'number' && !isNaN(val) && val > 0) ||
                  'Please enter a valid price',
              ]"
            />

            <div class="q-gutter-sm">
              <q-radio
                v-model="typeId"
                v-for="t in typeStore.types"
                :key="t.id ?? 0"
                :val="t.id ?? 0"
                :label="t.name"
              />
            </div>

            <q-file outlined v-model="file" accept="image/*" label="Upload Image">
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="reset" class="bg-coffee text-white" />
          <q-btn flat label="Submit" @click="save" class="bg-coffee text-white" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogrange" persistent>
      <q-card style="min-width: 350px" class="my-card">
        <div class="text-h6">{{ id === 0 ? 'Add New Product' : 'Edit Product' }}</div>

        <q-card-section class="q-pt-none">
          <q-form ref="form" @submit="save" @reset="onReset" class="q-gutter-md">
            <q-input
              filled
              v-model="min"
              label="min"
              hint="Name Product"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Please enter name product']"
            />
            <q-input
              filled
              v-model="max"
              label="max"
              hint="Name Product"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Please enter name product']"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="closeDialograge()" class="bg-coffee text-white" />
          <q-btn flat label="Submit" @click="callgetPriceRange()" class="bg-coffee text-white" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialoAddpcd" persistent>
      <q-card style="min-width: 350px" class="my-card">
        <div class="text-h6">{{ id === 0 ? 'Add New Product' : 'Edit Product' }}</div>

        <q-card-section class="q-pt-none">
          <q-form ref="form" @submit="save" @reset="onReset" class="q-gutter-md">
            <q-input
              filled
              v-model="name"
              label="name"
              hint="Name Product"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Please enter name product']"
            />
            <q-input
              filled
              v-model="price"
              label="price"
              hint="Name Product"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Please enter name product']"
            />
            <q-input
              filled
              v-model="typeId"
              label="typeId"
              hint="Name Product"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Please enter name product']"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="closeDialograge()" class="bg-coffee text-white" />
          <q-btn
            flat
            label="Submit"
            @click="addProductByProcedure()"
            class="bg-coffee text-white"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogSuccess" persistent>
      <q-card style="min-width: 300px">
        <q-card-section class="text-center">
          <q-icon name="check_circle" color="green" size="48px" />
          <div class="text-h6 text-green q-mt-md">เพิ่มสินค้าสำเร็จ!</div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn flat label="ตกลง" @click="dialogSuccess = false" class="bg-green text-white" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialograngeavg" persistent>
      <q-card style="min-width: 350px" class="my-card">
        <div class="text-h6">{{ id === 0 ? 'Add New Product' : 'Edit Product' }}</div>

        <q-card-section>
          <div class="text-h6 text-center text-primary">
            พบสินค้าทั้งหมด {{ total }} รายการ ในช่วงราคานี้
          </div>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="closeDialogrageavg()" class="bg-coffee text-white" />
          <q-btn flat label="Submit" @click="callgetPriceRange()" class="bg-coffee text-white" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ✅ ตารางแสดงผลลัพธ์จาก Stored Procedure -->
    <q-table
      :columns="columns"
      :rows="productStore.searchedProducts"
      title="ผลลัพธ์จากการค้นหาประเภทและราคา"
      class="my-table q-mb-xl"
      v-if="productStore.searchedProducts.length > 0"
    >
      <template v-slot:body-cell-image-url="{ row }">
        <td class="q-td">
          <q-img :src="'http://localhost:3000' + row.imageUrl" style="max-width: 100px" />
        </td>
      </template>
    </q-table>

    <q-table :columns="columns" :rows="productStore.products" class="my-table">
      <template v-slot:body-cell-operation="{ row }">
        <td class="q-td text-center">
          <div class="flex justify-center items-center q-gutter-x-sm">
            <q-btn flat icon="edit" @click="edit(row)" class="text-primary" />
            <q-btn flat icon="delete" @click="remove(row)" class="text-negative" />
          </div>
        </td>
      </template>

      <template v-slot:body-cell-image-url="{ row }">
        <td class="q-td">
          <q-img :src="'http://localhost:3000' + row.imageUrl" style="max-width: 100px"></q-img>
        </td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import type { Product } from 'src/models'
import { onMounted, ref } from 'vue'
import { type QForm, type QTableColumn } from 'quasar'
import { useProductStore } from 'src/stores/productStore'
import { useTypeStore } from 'src/stores/typeStore'

const dialog = ref(false)
const dialogrange = ref(false)
const dialograngeavg = ref(false)
const dialogSuccess = ref(false)
const dialoAddpcd = ref(false)
const form = ref<QForm | null>(null)
const columns: QTableColumn[] = [
  {
    name: 'id',
    field: 'id',
    label: 'ID',
    align: 'center',
    sortable: true,
  },
  {
    name: 'image-url',
    field: 'imageUrl',
    label: 'Image',
    align: 'center',
    sortable: true,
  },
  {
    name: 'name',
    field: 'name',
    label: 'Name',
    align: 'center',
  },
  {
    name: 'typeId',
    label: 'typeId',
    field: 'typeId', // ✅ หรือ 'type_name' แล้วแต่ backend ส่งมา
    align: 'center',
  },
  {
    name: 'price',
    field: 'price',
    label: 'Price',
    align: 'center',
  },
  {
    name: 'operation',
    field: 'operation',
    label: '',
    align: 'center',
  },
]

const productStore = useProductStore()
const typeStore = useTypeStore()

const id = ref(0)
const name = ref('')
const min = ref('')
const max = ref('')
const typeId = ref(1)
const price = ref<number>(10)
const imageUrl = ref('')
const file = ref<File | null>(null)
import { computed } from 'vue'

const total = computed(() => productStore.total)

onMounted(async () => {
  await typeStore.getTypes()
  await productStore.getProducts()
})

function edit(row: Product) {
  id.value = row.id ?? 0
  name.value = row.name
  typeId.value = row.typeId
  price.value = row.price
  imageUrl.value = row.imageUrl ?? ''
  dialog.value = true
}

function save() {
  form.value?.validate().then(async (success) => {
    if (success) {
      if (id.value === 0) {
        await productStore.addProduct(
          {
            name: name.value,
            typeId: typeId.value,
            price: price.value,
          },
          file.value,
        )
      } else {
        await productStore.updateProduct(
          {
            name: name.value,
            typeId: typeId.value,
            price: price.value,
          },
          file.value,
        )
      }
      dialog.value = false
      onReset()
    }
  })
}

function reset() {
  form.value?.resetValidation()
  id.value = 0
  name.value = ''
  typeId.value = 1
  dialog.value = false
}
function closeDialogrageavg() {
  dialograngeavg.value = false
}

function closeDialograge() {
  dialogrange.value = false
}

function callgetPriceRange() {
  productStore.getPriceRange(Number(min.value), Number(max.value))
  dialogrange.value = false
  dialograngeavg.value = true
}

async function addProductByProcedure() {
  form.value?.validate().then(async (success) => {
    if (success) {
      await productStore.addProductByProcedure({
        name: name.value,
        price: price.value,
        typeId: typeId.value,
      })
      dialoAddpcd.value = false
      dialogSuccess.value = true // ✅ เปิด Dialog สำเร็จ
      onReset()
    }
  })
}

function callgetPriceRangedialog() {
  dialogrange.value = true
}

function callgetaddproductbypcd() {
  dialoAddpcd.value = true
}

function onReset() {
  id.value = 0
  name.value = ''
  typeId.value = 1
  dialog.value = false
}

function remove(row: Product) {
  productStore.delProduct(row)
}

// ✅ ตัวแปรสำหรับค้นหา
const searchTypeId = ref(1)
const searchPrice = ref(100)

// ✅ ฟังก์ชันเรียกใช้ Stored Procedure
function searchByTypeAndPrice() {
  productStore.getProductsByTypeAndPrice(searchPrice.value, searchTypeId.value)
}
</script>

<style scoped>
/* Custom Table Styling */
.my-table {
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.q-table th {
  background-color: #3e2723;
  color: #fff;
  font-weight: bold;
  font-size: 24px;
}

.q-table td {
  color: #333;
  font-size: 24px;
}

.q-table .q-tr:nth-child(even) {
  background-color: #f1f1f1;
}

.q-table .q-tr:nth-child(odd) {
  background-color: #ffffff;
}

.q-table .q-td {
  padding: 20px;
}

.my-card {
  background-color: #f3e5f5;
}

.q-card-actions .q-btn {
  background-color: #5d4037;
  color: white;
}

.q-dialog {
  padding: 20px;
}

/* ทำให้ปุ่มในส่วน operation สีอ่อนลง */
.bg-light-brown {
  background-color: #d7ccc8; /* สีสีน้ำตาลอ่อน */
}

.text-dark {
  color: #4e342e; /* สีข้อความเข้ม */
}

/* ปรับระยะห่างระหว่างปุ่มในส่วน operation */
.q-td q-btn {
  margin-right: 20px; /* เพิ่มระยะห่างระหว่างปุ่ม */
}
</style>
