<template>
  <q-page padding class="q-pa-md">
    <h3 class="q-my-md text-center text-blue">Check In / Out</h3>

    <div v-if="authStore.currentUser" class="q-mb-md text-center">
      <q-banner inline-actions class="bg-brown-7 text-white q-pa-sm rounded-borders">
        <q-icon name="person" size="sm" class="q-mr-sm" />
        Logged in as: {{ authStore.currentUser.login }} ({{ authStore.currentUser.email }})
      </q-banner>
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

interface Checkinout {
  id: string
  userId: number
  checkInTime: string | Date
  checkOutTime: string | Date | null
}

// ✅ Table columns พร้อม type-safe format
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

// ✅ Load checkinout data from backend
const loadCheckinData = async () => {
  try {
    const res = await axios.get('http://localhost:3000/checkinout')
    checkinData.value = res.data
  } catch (err) {
    console.error('โหลดข้อมูล checkin ล้มเหลว', err)
  }
}

// ✅ Check-in
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

// ✅ Check-out
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

// ✅ Search filter
const filteredUsers = computed(() =>
  userStore.users.filter((user) =>
    user.login.toLowerCase().includes(searchQuery.value.toLowerCase()),
  ),
)

// ✅ Watch for auth changes
watch(
  () => authStore.currentUser,
  async (newUser, oldUser) => {
    if (newUser?.id) await checkIn(newUser.id)
    if (!newUser && oldUser?.id) await checkOut(oldUser.id)
  },
  { immediate: true },
)

// ✅ Initial load
onMounted(async () => {
  await userStore.getUsers()
  await loadCheckinData()
})
</script>
