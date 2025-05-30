<template>
  <h3 class="q-my-md text-center text-blue">User Management</h3>
  <q-page padding>
    <div class="row justify-end">
      <q-btn icon="add" flat label="Add User" @click="dialog = true" />
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 350px" class="my-card">
        <q-card-section>
          <div class="text-h6">{{ id === 0 ? 'Add New User' : 'Edit User' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form ref="form" class="q-gutter-md">
            <q-input
              filled
              v-model="login"
              label="Your login *"
              hint="Login with Email"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Please type something']"
            />

            <q-input
              filled
              type="password"
              v-model="password"
              label="Your Password"
              lazy-rules
              :rules="[(val) => (val !== null && val !== '') || 'Please type your password']"
            />
            <q-input
              filled
              v-model.number="age"
              label="Your Age *"
              hint="Age"
              lazy-rules
              type="number"
              :rules="[(val) => val >= 10 || 'Please type age']"
            />
            <div class="q-gutter-sm">
              <q-checkbox
                v-for="role in roleOptions"
                :key="role.value"
                v-model="roles"
                :val="role.value"
                :label="role.label"
              />
            </div>
            <div class="q-gutter-sm">
              <q-radio v-model="gender" val="male" label="Male" />
              <q-radio v-model="gender" val="female" label="Female" />
            </div>
            <q-select
              filled
              v-model="branchId"
              :options="branchOptions"
              label="Select Branch"
              emit-value
              map-options
            />
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

    <q-table :columns="columns" :rows="userStore.users" class="my-table">
      <template v-slot:body-cell-operation="{ row }">
        <td class="q-td text-center">
          <q-btn
            flat
            icon="edit"
            @click="edit(row)"
            class="text-primary"
            style="margin-right: 8px"
          />
          <q-btn flat icon="delete" @click="remove(row)" class="text-negative" />
        </td>
      </template>

      <template v-slot:body-cell-image-url="{ row }">
        <td class="q-td">
          <q-img
            :src="'http://localhost:3000' + row.imageUrl"
            style="max-width: 70px; max-height: 70px"
          />
        </td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from 'src/stores/userStore'
import { useBranchStore } from 'src/stores/branchStore'
import type { QTableColumn } from 'quasar'
import { QForm } from 'quasar'
import type { User } from 'src/models'

const dialog = ref(false)
const form = ref<QForm | null>(null)
const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'image-url', label: 'Image', field: 'imageUrl', align: 'center' },
  { name: 'login', label: 'Login', field: 'login', align: 'center' },
  // { name: 'password', label: 'Password', field: 'password', align: 'center' },
  { name: 'gender', label: 'Gender', field: 'gender', align: 'center' },
  { name: 'operation', label: '', field: 'operation', align: 'center' },
]

const userStore = useUserStore()
const branchStore = useBranchStore()
const id = ref(0)
const login = ref('')
const password = ref('')
const roles = ref<number[]>([])
const gender = ref<'male' | 'female'>('male')
const age = ref<number>(10)
const file = ref<File | null>(null)
const branchId = ref<number | null>(null) // <-- เปลี่ยนเป็น number | null
const roleOptions = [
  { label: 'Owner', value: 1 },
  { label: 'Manager', value: 2 },
  { label: 'Staff', value: 3 },
]
const branchOptions = ref<{ label: string; value: number }[]>([])

onMounted(async () => {
  await userStore.getUsers()
  await branchStore.getBranches()
  branchOptions.value = branchStore.branches.map((branch) => ({
    label: branch.name,
    value: branch.id,
  }))
})

function edit(row: User) {
  id.value = row.id
  login.value = row.login
  password.value = row.password
  gender.value = row.gender
  age.value = row.age
  branchId.value = row.branchId ?? null // ใช้ null ถ้าไม่มีค่า
  dialog.value = true
}

function save() {
  form.value?.validate().then(async (success) => {
    if (success) {
      // ถ้าผู้ใช้ไม่เลือกสาขา ให้ส่งค่า null ไป
      const branchData =
        branchId.value !== null && branchId.value !== undefined ? branchId.value : null

      if (id.value === 0) {
        await userStore.addUser(
          {
            id: id.value,
            login: login.value,
            password: password.value,
            roles: roles.value,
            gender: gender.value,
            age: age.value,
            branchId: branchData, // ส่งค่า branchId ที่รองรับ null
          },
          file.value,
        )
      } else {
        await userStore.updateUser(
          {
            id: id.value,
            login: login.value,
            password: password.value,
            roles: roles.value,
            gender: gender.value,
            age: age.value,
            branchId: branchData, // ส่งค่า branchId ที่รองรับ null
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
  login.value = ''
  password.value = ''
  dialog.value = false
}

function remove(row: User) {
  userStore.delUser(row)
}

function onReset() {
  id.value = 0
  login.value = ''
  password.value = ''
  dialog.value = false
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
  font-size: 14px;
}

.q-table td {
  color: #333;
  font-size: 14px;
}

.q-table .q-tr:nth-child(even) {
  background-color: #f1f1f1;
}

.q-table .q-tr:nth-child(odd) {
  background-color: #ffffff;
}

.q-table .q-td {
  padding: 10px;
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

.text-dark {
  color: #4e342e; /* สีข้อความเข้ม */
}

/* ปรับระยะห่างระหว่างปุ่มในส่วน operation */
.q-td q-btn {
  margin-right: 8px; /* เพิ่มระยะห่างระหว่างปุ่ม */
}
</style>
