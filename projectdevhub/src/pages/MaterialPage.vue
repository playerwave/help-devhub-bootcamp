MaterialPage

<template>
  <q-page padding>
    <h3 class="q-my-md text-center text-blue">Material</h3>

    <div class="row justify-between q-mb-md">
      <q-btn icon="shopping_cart" flat label="Buy Material" @click="openPurchaseDialog" />
      <q-btn icon="list" color="primary" flat label="Material Usage Report" @click="openAllUsage" />
    </div>

    <!-- Dialog: Add/Edit Material -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ id === 0 ? 'Add New Material' : 'Edit Material' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form ref="form" class="q-gutter-md">
            <!-- ฟิลด์ที่ให้แก้ไขได้ -->
            <q-input
              filled
              v-model="name"
              label="Name *"
              lazy-rules
              :rules="[(val) => !!val || 'Required']"
            />
            <q-input filled v-model="description" label="Description" />
            <q-input filled v-model.number="price" label="Price" type="number" />
            <q-input filled v-model="unit" label="Unit" />
            <q-input
              filled
              v-model.number="quantityPerUnit"
              label="Remaining"
              type="number"
              min="0"
            />

            <!-- ไม่ต้องแสดงฟิลด์อื่นๆ ที่ไม่ให้แก้ไข เช่น remaining, createdAt -->
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveMaterial" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Table: Material List -->
    <q-table
      :columns="columns"
      :rows="materialStore.materials"
      flat
      bordered
      row-key="id"
      class="material-table"
    >
      <template v-slot:body-cell-operation="{ row }">
        <td class="q-td operation-cell">
          <div class="flex justify-center items-center q-gutter-sm">
            <q-btn flat icon="edit" @click="edit(row)" class="text-primary" />
            <q-btn flat icon="delete" @click="remove(row)" class="text-negative" />
            <q-btn flat icon="inventory" @click="openUsageForm(row)" class="text-teal" />
          </div>
        </td>
      </template>
    </q-table>

    <!-- Dialog: Usage Report (All) -->

    <q-dialog v-model="allUsageDialog">
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">รายงานการใช้วัสดุทั้งหมด</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none">
          <q-list bordered separator>
            <q-item v-for="(usage, index) in materialUsageStore.allMaterialUsageList" :key="index">
              <q-item-section>
                <div>
                  <strong>{{ usage.material?.name }}</strong
                  ><br />
                  {{ new Date(usage.usedAt).toLocaleString('th-TH') }} - {{ usage.quantityUsed }}
                  {{ usage.material?.unit }}
                  <span v-if="usage.note">({{ usage.note }})</span>
                </div>
              </q-item-section>
            </q-item>
            <q-item v-if="materialUsageStore.allMaterialUsageList.length === 0">
              <q-item-section class="text-grey">ยังไม่มีการใช้วัสดุ</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="ปิด" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Use Material -->
    <q-dialog v-model="useDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">ใช้วัตถุดิบ: {{ selectedMaterial?.name }}</div>
        </q-card-section>

        <q-card-section>
          <q-form class="q-gutter-md" @submit.prevent="submitUsage">
            <q-input
              v-model.number="usedQuantity"
              type="number"
              label="จำนวนที่ใช้ *"
              :rules="[(val) => val > 0 || 'ต้องมากกว่า 0']"
              filled
            />
            <q-input v-model="usageNote" type="textarea" label="หมายเหตุ" filled />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" v-close-popup />
          <q-btn flat label="บันทึก" color="primary" @click="submitUsage" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="purchaseDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">สั่งซื้อวัตถุดิบ</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form class="q-gutter-md" @submit.prevent="submitPurchase">
            <div v-for="material in materialStore.materials" :key="material.id!">
              <div class="row items-center q-gutter-sm q-mb-sm">
                <div class="col-6">
                  <q-input
                    v-model.number="purchaseQuantities[material.id!]"
                    :label="material.name"
                    type="number"
                    min="0"
                    filled
                  />
                </div>
                <div class="col text-grey">
                  คงเหลือ: {{ material.quantityPerUnit ?? 0 }} {{ material.unit }}
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <!-- ✅ ปุ่มเพิ่มวัตถุดิบใหม่ ย้ายออกมาอยู่ตรงนี้ -->
        <q-card-section>
          <q-btn
            flat
            icon="add"
            label="เพิ่มวัตถุดิบใหม่"
            color="primary"
            @click="
              () => {
                openAddMaterialDialog()
              }
            "
          />
        </q-card-section>

        <!-- ✅ ปุ่มคำสั่ง -->
        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" color="primary" v-close-popup />
          <q-btn flat label="สั่งซื้อ" color="primary" @click="submitPurchase" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import type { Material } from 'src/models'
import { nextTick, onMounted, ref } from 'vue'
import { type QForm, type QTableColumn } from 'quasar'
import { useMaterialStore } from 'src/stores/materialStore'
import { useMaterialUsageStore } from 'src/stores/materialUsageStore'
import { Notify } from 'quasar'

const dialog = ref(false)
const form = ref<QForm | null>(null)
const useDialog = ref(false)
const allUsageDialog = ref(false)

const materialStore = useMaterialStore()
const materialUsageStore = useMaterialUsageStore()

const selectedMaterial = ref<Material | null>(null)
const usedQuantity = ref<number>(1)
const usageNote = ref('')

const purchaseDialog = ref(false)
const purchaseQuantities = ref<Record<number, number>>({})

const columns: QTableColumn[] = [
  // { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'name', label: 'Name', field: 'name', align: 'center' },
  { name: 'description', label: 'Description', field: 'description', align: 'center' },
  { name: 'price', label: 'Price', field: 'price', align: 'center' },
  { name: 'unit', label: 'Unit', field: 'unit', align: 'center' },
  { name: 'quantityPerUnit', label: 'remaining', field: 'quantityPerUnit', align: 'center' },
  { name: 'operation', label: '', field: 'operation', align: 'center' },
]

const id = ref(0)
const name = ref('')
const description = ref('')
const price = ref<number>(0)
const unit = ref('')
const quantityPerUnit = ref<number>(0)

onMounted(async () => {
  await materialStore.getMaterials()
})

function edit(row: Material) {
  id.value = row.id ?? 0
  name.value = row.name
  description.value = row.description ?? ''
  price.value = row.price
  unit.value = row.unit
  quantityPerUnit.value = row.quantityPerUnit ?? 0
  dialog.value = true
}

function saveMaterial() {
  form.value?.validate().then(async (success) => {
    if (success) {
      if (id.value === 0) {
        await materialStore.addMaterial({
          name: name.value,
          description: description.value,
          price: price.value,
          unit: unit.value,
          quantityPerUnit: quantityPerUnit.value,
        })
      } else {
        await materialStore.updateMaterial({
          id: id.value,
          name: name.value,
          description: description.value,
          price: price.value,
          unit: unit.value,
        })
      }

      dialog.value = false
      await materialStore.getMaterials() // ✅ เพิ่มตรงนี้
      reset()
    }
  })
}

function reset() {
  form.value?.resetValidation()
  id.value = 0
  name.value = ''
  description.value = ''
  price.value = 0
  unit.value = ''
  quantityPerUnit.value = 0
  dialog.value = false
}

function remove(row: Material) {
  materialStore.deleteMaterial(row)
}

async function openAllUsage() {
  allUsageDialog.value = true
  await materialUsageStore.fetchAllUsage()
}

function openUsageForm(row: Material) {
  selectedMaterial.value = row
  usedQuantity.value = 1
  usageNote.value = ''
  useDialog.value = true
}

async function submitUsage() {
  if (!selectedMaterial.value || selectedMaterial.value.id === undefined) return

  try {
    await materialUsageStore.addUsage({
      materialId: selectedMaterial.value.id,
      quantityUsed: usedQuantity.value,
      note: usageNote.value,
    })

    useDialog.value = false
    await materialStore.getMaterials()

    Notify.create({
      color: 'positive',
      position: 'top',
      message: 'บันทึกการใช้วัตถุดิบสำเร็จ',
      icon: 'check_circle',
    })
  } catch (err: unknown) {
    console.error(err)

    const errorMessage =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'เกิดข้อผิดพลาดในการใช้วัตถุดิบ'

    Notify.create({
      color: 'negative',
      position: 'top',
      message: errorMessage, // ✅ แสดง "วัตถุดิบคงเหลือไม่เพียงพอ" ได้เลย
      icon: 'report_problem',
    })
  }
}
function openPurchaseDialog() {
  purchaseQuantities.value = {}
  materialStore.materials.forEach((mat) => {
    purchaseQuantities.value[mat.id!] = 0
  })
  purchaseDialog.value = true
}

function openAddMaterialDialog() {
  purchaseDialog.value = false
  nextTick(() => {
    reset()
    dialog.value = true
  })
}

async function submitPurchase() {
  const itemsToPurchase = Object.entries(purchaseQuantities.value).filter(([, qty]) => qty > 0)

  if (itemsToPurchase.length === 0) {
    Notify.create({
      type: 'warning',
      message: 'กรุณาระบุจำนวนวัตถุดิบที่ต้องการสั่งซื้อ',
    })
    return
  }

  try {
    for (const [id, quantity] of itemsToPurchase) {
      const material = materialStore.materials.find((m) => m.id === Number(id))
      if (material) {
        await materialStore.updateMaterial({
          id: material.id!,
          name: material.name,
          price: material.price,
          unit: material.unit,
          description: material.description ?? '',
          quantityPerUnit: (material.quantityPerUnit ?? 0) + quantity,
        })
      }
    }

    Notify.create({
      type: 'positive',
      message: 'สั่งซื้อวัตถุดิบเรียบร้อยแล้ว',
    })

    await materialStore.getMaterials()
    purchaseDialog.value = false
  } catch (err) {
    console.error(err)
    Notify.create({
      type: 'negative',
      message: 'เกิดข้อผิดพลาดในการสั่งซื้อ',
    })
  }
}
</script>

<style scoped>
.material-table .q-td {
  font-size: 16px;
  padding: 12px;
}
.material-table .q-th {
  font-size: 15px;
}
.operation-cell {
  vertical-align: middle;
  text-align: center;
}
</style>
