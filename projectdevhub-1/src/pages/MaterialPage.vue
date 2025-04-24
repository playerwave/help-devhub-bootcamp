<template>
  <q-page padding>
    <h3 class="q-my-md text-center text-blue">Material</h3>

    <div class="row justify-between q-mb-md">
      <q-btn icon="shopping_cart" flat label="Buy Material" @click="openPurchaseDialog" />
      <q-btn icon="list" color="primary" flat label="Material Usage Report" @click="openAllUsage" />
      <q-btn
        icon="history"
        color="secondary"
        flat
        label="Purchase History"
        @click="openPurchaseHistoryDialog"
      />
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ id === 0 ? 'Add New Material' : 'Edit Material' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form ref="form" class="q-gutter-md">
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
              :readonly="id !== 0" 
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveMaterial" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-table
      :columns="columns"
      :rows="materialStore.materials"
      flat
      bordered
      row-key="id"
      class="material-table"
    >
      <template v-slot:body-cell-quantityPerUnit="{ row }">
        <td class="q-td" :class="{ 'bg-yellow-3': row.quantityPerUnit <= 3 }">
          <div class="flex items-center justify-between" style="width: 100%">
            <span style="flex-grow: 1; text-align: center">{{ row.quantityPerUnit }}</span>
          </div>
        </td>
      </template>

      <template v-slot:body-cell-operation="{ row }">
        <td class="q-td operation-cell" :class="{ 'bg-white': row.quantityPerUnit <= 3 }">
          <div class="flex justify-center items-center q-gutter-sm">
            <q-btn flat icon="edit" @click="edit(row)" class="text-primary" />
            <q-btn flat icon="delete" @click="remove(row)" class="text-negative" />
            <q-btn flat icon="inventory" @click="openUsageForm(row)" class="text-teal" />
            <q-btn
              flat
              icon="history"
              @click="openMaterialPurchaseHistoryDialog(row)"
              class="text-grey-8"
            />
          </div>
        </td>
      </template>
      <!-- <template v-slot:body-cell-operation="{ row }">
        <td class="q-td operation-cell">
          <div class="flex justify-center items-center q-gutter-sm">
            <q-btn flat icon="edit" @click="edit(row)" class="text-primary" />
            <q-btn flat icon="delete" @click="remove(row)" class="text-negative" />
            <q-btn flat icon="inventory" @click="openUsageForm(row)" class="text-teal" />
            <q-btn
              flat
              icon="history"
              @click="openMaterialPurchaseHistoryDialog(row)"
              class="text-grey-8"
            />
          </div>
        </td>
      </template> -->
    </q-table>

    <q-dialog v-model="allUsageDialog">
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">รายงานการใช้วัตถุดิบทั้งหมด</div>
        </q-card-section>

        <!-- ตัวกรองวันที่เริ่มต้นและสิ้นสุด -->
        <q-separator />
        <q-card-section class="q-pt-none">
          <div class="row q-gutter-md items-center q-mb-md">
            <div class="col-6">
              <q-input
                v-model="startDate"
                :label="`เลือกวันที่เริ่มต้น`"
                dense
                outlined
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
            </div>

            <div class="col-6">
              <q-input
                v-model="endDate"
                :label="`เลือกวันที่สิ้นสุด`"
                dense
                outlined
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
        </q-card-section>

        <q-separator />

        <!-- แสดงรายงานการใช้วัสดุทั้งหมด -->
        <q-card-section class="q-pt-none">
          <q-list bordered separator>
            <q-item v-for="(usage, index) in filteredUsage" :key="index">
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
            <q-item v-if="filteredUsage.length === 0">
              <q-item-section class="text-grey">ยังไม่มีการใช้วัตถุดิบ</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="ปิด" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="allPurchaseHistoryDialog" style="min-width: 600px; max-width: 800px">
      <q-card>
        <q-card-section>
          <div class="text-h6">ประวัติการสั่งซื้อทั้งหมด</div>

          <!-- เลือกช่วงเวลา (วันที่เริ่มต้นและสิ้นสุด) -->
          <div class="row q-gutter-md items-center q-mb-md">
            <div class="col-6">
              <q-input
                v-model="startDate"
                :label="`เลือกวันที่เริ่มต้น`"
                dense
                outlined
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
            </div>

            <div class="col-6">
              <q-input
                v-model="endDate"
                :label="`เลือกวันที่สิ้นสุด`"
                dense
                outlined
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
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none">
          <q-list bordered separator>
            <!-- ใช้ filteredReceipts ในการแสดงข้อมูล -->
            <q-item v-for="(history, index) in filteredReceipts" :key="index">
              <q-item-section>
                <div>
                  <strong>{{ history.material?.name }}</strong
                  ><br />
                  วันที่:
                  {{
                    history.createdAt
                      ? new Date(history.createdAt).toLocaleString('th-TH')
                      : 'ไม่ระบุ'
                  }}<br />
                  จำนวน: {{ history.quantityPurchased }} {{ history.material?.unit }}
                  <span v-if="history.note">({{ history.note }})</span>
                </div>
              </q-item-section>
              <q-separator />
            </q-item>
            <q-item v-if="filteredReceipts.length === 0">
              <q-item-section class="text-grey">ยังไม่มีประวัติการสั่งซื้อ</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="ปิด" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" color="primary" v-close-popup />
          <q-btn flat label="สั่งซื้อ" color="primary" @click="submitPurchase" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="materialPurchaseHistoryDialog" style="min-width: 600px; max-width: 800px">
      <q-card>
        <q-card-section>
          <div class="text-h6">ประวัติการสั่งซื้อ: {{ selectedMaterial?.name }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pt-none">
          <q-list bordered separator>
            <q-item v-for="(history, index) in materialPurchaseHistoryList" :key="index">
              <q-item-section>
                <div>
                  วันที่:
                  {{
                    history.createdAt
                      ? new Date(history.createdAt).toLocaleString('th-TH')
                      : 'ไม่ระบุ'
                  }}<br />
                  จำนวน: {{ history.quantityPurchased }} {{ selectedMaterial?.unit }}
                  <span v-if="history.note">({{ history.note }})</span>
                </div>
              </q-item-section>
            </q-item>
            <q-item v-if="materialPurchaseHistoryList.length === 0">
              <q-item-section class="text-grey"
                >ยังไม่มีประวัติการสั่งซื้อสำหรับ {{ selectedMaterial?.name }}</q-item-section
              >
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="ปิด" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import type { Material, MaterialPurchaseHistory } from 'src/models'
import { nextTick, onMounted, computed, ref } from 'vue'
import { type QForm, type QTableColumn } from 'quasar'
import { useMaterialStore } from 'src/stores/materialStore'
import { useMaterialUsageStore } from 'src/stores/materialUsageStore'
import { Notify } from 'quasar'

const dialog = ref(false)
const form = ref<QForm | null>(null)
const useDialog = ref(false)
const allUsageDialog = ref(false)
const purchaseDialog = ref(false)
const allPurchaseHistoryDialog = ref(false) // ✅ Dialog สำหรับแสดงประวัติการสั่งซื้อทั้งหมด
const materialPurchaseHistoryDialog = ref(false) // ✅ Dialog สำหรับแสดงประวัติการสั่งซื้อเฉพาะวัสดุ
const materialPurchaseHistoryList = ref<MaterialPurchaseHistory[]>([]) // ✅ List สำหรับเก็บประวัติการสั่งซื้อเฉพาะวัสดุ

const materialStore = useMaterialStore()
const materialUsageStore = useMaterialUsageStore()

const selectedMaterial = ref<Material | null>(null)
const usedQuantity = ref<number>(1)
const usageNote = ref('')
const purchaseQuantities = ref<Record<number, number>>({})

// ตัวแปรวันที่เริ่มต้นและสิ้นสุด
const startDate = ref<string>('')
const endDate = ref<string>('')

// กำหนด type/mask สำหรับ q-date
const datePickerType = computed(() => 'day')
const datePickerMask = computed(() => 'YYYY-MM-DD')

// ฟังก์ชันเมื่อเลือกวันที่เริ่มต้น
const onStartDateSelected = (val: string) => {
  startDate.value = val
}

// ฟังก์ชันเมื่อเลือกวันที่สิ้นสุด
const onEndDateSelected = (val: string) => {
  endDate.value = val
}

// ฟิลเตอร์ใบเสร็จตามช่วงวันที่ที่เลือก
const formattedReceipts = computed(() => materialStore.allPurchaseHistory)

// const filteredReceipts = computed(() => {
//   if (!startDate.value || !endDate.value) return formattedReceipts.value

//   const start = new Date(startDate.value)
//   const end = new Date(endDate.value)

//   return formattedReceipts.value.filter((receipt) => {
//     const createdAt = receipt.createdAt
//     if (!createdAt) return false // ถ้า createdAt เป็น undefined หรือ null จะไม่ให้แสดง

//     const created = new Date(createdAt)
//     return created >= start && created <= end
//   })
// })

// ฟิลเตอร์ใบเสร็จตามช่วงวันที่ที่เลือก
const filteredReceipts = computed(() => {
  if (!startDate.value || !endDate.value) return formattedReceipts.value

  // แปลง startDate และ endDate เป็นวันที่
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  // ตัดเวลาออกจากวันที่
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return formattedReceipts.value.filter((receipt) => {
    const createdAt = receipt.createdAt
    if (!createdAt) return false // ถ้า createdAt เป็น undefined หรือ null จะไม่ให้แสดง

    // แปลง createdAt เป็นวันที่
    const created = new Date(createdAt)
    created.setHours(0, 0, 0, 0) // ตัดเวลาออก

    // เปรียบเทียบแค่วันที่
    return created >= start && created <= end
  })
})

// ฟิลเตอร์รายงานการใช้วัสดุตามช่วงวันที่ที่เลือก
const filteredUsage = computed(() => {
  const allUsage = materialUsageStore.allMaterialUsageList
  if (!startDate.value || !endDate.value) return allUsage

  // แปลง startDate และ endDate เป็นวันที่
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)

  // ตัดเวลาออกจากวันที่
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return allUsage.filter((usage) => {
    const usedAt = usage.usedAt
    if (!usedAt) return false // ถ้า usedAt เป็น undefined หรือ null จะไม่ให้แสดง

    // แปลง usedAt เป็นวันที่
    const usedDate = new Date(usedAt)
    usedDate.setHours(0, 0, 0, 0) // ตัดเวลาออก

    // เปรียบเทียบแค่วันที่
    return usedDate >= start && usedDate <= end
  })
})

onMounted(async () => {
  await materialUsageStore.fetchAllUsage()
})

const columns: QTableColumn[] = [
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
  await materialStore.fetchAllPurchaseHistory() // ✅ โหลดประวัติการสั่งซื้อทั้งหมดเมื่อ Component Mount
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

async function saveMaterial() {
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

        const added = materialStore.materials.find((m) => m.name === name.value)
        if (added?.id) {
          await materialStore.purchaseMaterial(added.id, quantityPerUnit.value, 'เพิ่มวัตถุดิบใหม่')
        }
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
      await materialStore.getMaterials()
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
      message: errorMessage,
      icon: 'report_problem',
    })
  }
}

function openPurchaseDialog() {
  // purchaseQuantities.value
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
          quantityPerUnit: (material.quantityPerUnit ?? 0) + Number(quantity),
        })

        await materialStore.purchaseMaterial(material.id!, Number(quantity), 'สั่งซื้อเพิ่ม')
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

async function openPurchaseHistoryDialog() {
  allPurchaseHistoryDialog.value = true
  await materialStore.fetchAllPurchaseHistory()
}

async function openMaterialPurchaseHistoryDialog(row: Material) {
  selectedMaterial.value = row
  if (row.id) {
    await materialStore.fetchPurchaseHistoryByMaterialId(row.id)
    materialPurchaseHistoryList.value = materialStore.materialPurchaseHistoryList
    materialPurchaseHistoryDialog.value = true
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
