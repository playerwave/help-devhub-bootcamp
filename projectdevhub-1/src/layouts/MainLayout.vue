<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="bg-coffee text-white">
      <q-toolbar>
        <!-- Menu Button -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          color="white"
        />

        <!-- Logo -->
        <q-img
          src="/logo.png"
          style="
            width: 40px;
            height: 40px;
            border-radius: 8px;
            margin-left: 20px;
            margin-right: 8px;
          "
          contain
        />

        <!-- Title -->
        <q-toolbar-title class="text-white text-h6">D-Coffee</q-toolbar-title>

        <!-- User Info -->
        <div class="q-ml-md row items-center q-gutter-sm q-pr-md user-info">
          <q-icon name="person" size="20px" />
          <span>{{ authStore.currentUser?.login || '-' }}</span>

          <q-badge color="primary" align="middle">
            {{ authStore.currentUser?.role || 'User' }}
          </q-badge>

          <q-badge color="secondary" align="middle">
            {{ getBranchNameById(authStore.currentUser?.branchId) }}
          </q-badge>
        </div>

        <!-- Logout Button -->
        <q-btn icon="logout" @click="authStore.logout()" flat color="white" />
      </q-toolbar>
    </q-header>

    <!-- Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-coffee-light text-white">
      <q-list>
        <q-item-label header class="text-subtitle2 q-pa-md text-center text-bold drawer-header">
          Menu
        </q-item-label>

        <!-- Loop through links -->
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container class="bg-page">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue'
import { useAuthStore } from 'src/stores/authStore'

const authStore = useAuthStore()

const branchList = [
  { id: 1, name: 'Chiang Mai Branch' },
  { id: 2, name: 'Chonburi Branch' },
  { id: 3, name: 'Bangkok Branch' },
  { id: 4, name: 'Phuket Branch' },
  { id: 5, name: 'Khon Kaen Branch' },
  { id: 6, name: 'Nakhon Ratchasima Branch' },
  { id: 7, name: 'Hat Yai Branch' },
]

function getBranchNameById(id: number | undefined) {
  const found = branchList.find((branch) => branch.id === id)
  return found ? found.name : '-'
}

const linksList: EssentialLinkProps[] = [
  {
    title: 'First Page',
    caption: 'First page',
    icon: 'article',
    link: '/first-page',
  },
  {
    title: 'POS',
    caption: 'Point Of Sale',
    icon: 'coffee',
    link: '/pos',
  },
  {
    title: 'Order',
    caption: 'Order Page',
    icon: 'receipt_long',
    link: '/order-page',
  },
  {
    title: 'User',
    caption: 'User Management',
    icon: 'account_circle',
    link: '/user-page',
  },
  {
    title: 'Product',
    caption: 'Product',
    icon: 'shopping_cart',
    link: '/product-page',
  },
  {
    title: 'Material',
    caption: 'Material',
    icon: 'inventory_2',
    link: '/material-page',
  },
  {
    title: 'Receipt',
    caption: 'Receipt Page',
    icon: 'receipt',
    link: '/reciept-page',
  },
  {
    title: 'Check In/Out',
    caption: 'Attendance Tracking',
    icon: 'checkInOut',
    link: '/checkInOut-page',
  },
  {
    title: 'Payment',
    caption: 'Payment Page',
    icon: 'payment',
    link: '/payment-page',
  },
  {
    title: 'Customer',
    caption: 'Customer Page',
    icon: 'people',
    link: '/customer-page',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
/* Background Colors */
.bg-coffee {
  background-color: #5d4037; /* Dark Coffee Brown */
}

.bg-coffee-light {
  background-color: #8d6e63; /* Light Coffee Brown */
}

.bg-page {
  background-color: #eccea5; /* Creamy Coffee Background */
  min-height: 100vh;
}

/* Toolbar Title */
.q-toolbar-title {
  font-weight: bold;
  font-family: 'Kanit', sans-serif;
  letter-spacing: 0.5px;
  font-size: 1.5rem;
}

/* Buttons */
.q-btn {
  padding: 6px 12px;
}

/* Drawer Header */
.drawer-header {
  font-size: 22px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
  color: #000000; /* เปลี่ยนเป็นสีขาวอ่อนเพื่อให้เห็นได้ชัดเจนขึ้น */
}

/* Menu Item Style */
.q-item-label {
  font-size: 18px;
  font-weight: 500;
  color: #000000; /* เปลี่ยนสีตัวอักษรเป็นดำ เพื่อความชัดเจน */
  transition: color 0.3s ease;
}

/* Item styling for better readability */
.q-list .q-item {
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: #000000; /* สีตัวอักษร */
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.q-list .q-item:hover {
  background-color: #6f4f28; /* สีพื้นหลังเมื่อ hover */
  color: #ffffff; /* เปลี่ยนสีตัวอักษรเป็นขาวเมื่อ hover */
}

.user-info {
  font-size: 14px;
  font-weight: 500;
  color: white;
}
</style>
