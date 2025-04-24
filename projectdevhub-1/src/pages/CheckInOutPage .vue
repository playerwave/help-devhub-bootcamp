<template>
  <q-page padding class="q-pa-md">
    <h3 class="q-my-md text-center text-blue">Check In / Out</h3>

    <div v-if="authStore.currentUser" class="q-mb-md text-center">
      <q-banner inline-actions class="bg-brown-7 text-white q-pa-sm rounded-borders">
        <q-icon name="person" size="sm" class="q-mr-sm" />
        Logged in as: {{ authStore.currentUser.login }} ({{ authStore.currentUser.email }})
      </q-banner>
    </div>

    <!-- ตัวเลือกช่วงเวลา -->
    <div class="row q-gutter-md items-center q-mb-md">
      <div class="q-gutter-md">
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

    <q-input
      v-model="searchQuery"
      label="🔍 ค้นหาผู้ใช้..."
      filled
      clearable
      dense
      class="q-mb-md"
    />

    <div class="row q-col-gutter-md">
      <div v-for="user in filteredUsers" :key="user.id" class="col-xs-12 col-sm-6 col-md-4">
        <q-card class="shadow-1 rounded-borders">
          <q-card-section class="bg-grey-2 text-center">
            <div class="text-subtitle1 text-bold">{{ user.login }}</div>
          </q-card-section>

          <q-card-section class="q-pa-md text-center">
            <q-badge
              :color="user.status === 'Checked In' ? 'teal-6' : 'deep-orange-6'"
              class="q-pa-xs text-bold"
            >
              {{ user.status || 'Not Checked' }}
            </q-badge>
            <div class="text-caption text-grey-8 q-mt-xs">
              <q-icon name="schedule" size="xs" class="q-mr-xs" />
              {{ user.time || 'N/A' }}
            </div>
          </q-card-section>

          <q-card-actions align="center" class="q-pa-xs">
            <q-btn
              flat
              dense
              color="teal-8"
              icon="check"
              label="Check In"
              class="q-mx-xs text-bold"
              @click="checkIn(user.id)"
            />
            <q-btn
              flat
              dense
              color="deep-orange-8"
              icon="logout"
              label="Check Out"
              class="q-mx-xs text-bold"
              @click="checkOut(user.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-separator spaced />

    <q-table
      title="รายการ Check-in / Check-out"
      :rows="checkinData"
      :columns="checkinColumns"
      row-key="id"
      class="q-mt-md"
      flat
      bordered
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from 'src/stores/authStore'
import { useUserStore } from 'src/stores/userStore'

// Stores
const authStore = useAuthStore()
const userStore = useUserStore()

// State
const searchQuery = ref('')
const checkinMap = ref<Record<number, string>>({})
const checkinData = ref<Checkinout[]>([])

// ช่วงเวลาที่เลือก
const startDate = ref<string | null>(null)
const endDate = ref<string | null>(null)

// ตัวเลือกสำหรับ date picker
const datePickerType = 'date' // หรือ 'datetime' หากต้องการเวลา
const datePickerMask = 'YYYY-MM-DD' // ฟอร์แมตวันที่

interface Checkinout {
  id: string
  userId: number
  checkInTime: string | Date
  checkOutTime: string | Date | null
}

// ตารางแสดงข้อมูล
const checkinColumns = [
  {
    name: 'userId',
    label: 'User ID',
    field: 'userId' as const,
    align: 'center' as const,
    format: (val: string | number): string => String(val),
  },
  {
    name: 'checkInTime',
    label: 'Check-in Time',
    field: 'checkInTime' as const,
    align: 'center' as const,
    format: (val: string | Date): string =>
      new Date(val).toISOString().replace('T', ' ').slice(0, 19),
  },
  {
    name: 'checkOutTime',
    label: 'Check-out Time',
    field: 'checkOutTime' as const,
    align: 'center' as const,
    format: (val: string | Date | null): string =>
      val ? new Date(val).toISOString().replace('T', ' ').slice(0, 19) : 'ยังไม่ Check Out',
  },
]

// โหลดข้อมูลการเช็คอิน
const loadCheckinData = async () => {
  try {
    let url = 'http://localhost:3000/checkinout'

    // ถ้ามีช่วงเวลา กรอกตัวกรองลงใน URL
    if (startDate.value && endDate.value) {
      url += `?start=${startDate.value}&end=${endDate.value}`
    }

    const res = await axios.get(url)
    checkinData.value = res.data
  } catch (err) {
    console.error('โหลดข้อมูล checkin ล้มเหลว', err)
  }
}

const onStartDateSelected = (date: string) => {
  // เพิ่มเวลา 00:00:00 ให้กับวันที่เริ่มต้น
  startDate.value = `${date}T00:00:00`
  loadCheckinData() // โหลดข้อมูลใหม่เมื่อเลือกวันที่
}

const onEndDateSelected = (date: string) => {
  // เพิ่มเวลา 23:59:59 ให้กับวันที่สิ้นสุด
  endDate.value = `${date}T23:59:59`
  loadCheckinData() // โหลดข้อมูลใหม่เมื่อเลือกวันที่
}

// Check-in
const checkIn = async (userId: number) => {
  const timestamp = new Date().toLocaleString()

  try {
    const res = await axios.post('http://localhost:3000/checkinout/checkin', {
      userId: userId.toString(),
    })
    checkinMap.value[userId] = res.data.id
    await userStore.updateUserStatus(userId, { status: 'Checked In', time: timestamp })
    await loadCheckinData()
  } catch (err) {
    console.error('Check-in fail', err)
  }
}

// Check-out
const checkOut = async (userId: number) => {
  const checkinId = checkinMap.value[userId]
  const timestamp = new Date().toLocaleString()

  if (!checkinId) return

  try {
    await axios.patch(`http://localhost:3000/checkinout/checkout/${checkinId}`)
    await userStore.updateUserStatus(userId, { status: 'Checked Out', time: timestamp })
    await loadCheckinData()
  } catch (err) {
    console.error('Check-out fail', err)
  }
}

// ค้นหาผู้ใช้
const filteredUsers = computed(() =>
  userStore.users.filter((user) =>
    user.login.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
)

// ติดตามการเปลี่ยนแปลงของผู้ใช้ที่เข้าสู่ระบบ
watch(
  () => authStore.currentUser,
  async (newUser, oldUser) => {
    if (newUser?.id) await checkIn(newUser.id)
    if (!newUser && oldUser?.id) await checkOut(oldUser.id)
  },
  { immediate: true },
)

// โหลดข้อมูลเริ่มต้น
onMounted(async () => {
  await userStore.getUsers()
  await loadCheckinData()
})
</script>
