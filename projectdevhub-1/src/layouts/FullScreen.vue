<template>
  <q-layout view="hHh Lpr fFf">
    <!-- Header -->
    <q-header elevated class="bg-coffee text-white">
      <q-toolbar>

        <!-- ✅ LOGO -->
        <q-img
          src="/public/logo.png"
          style="width: 40px; height: 40px; margin-right: 12px;"
          contain
        />

        <!-- Title -->
        <q-toolbar-title>POS D-Coffee</q-toolbar-title>

        <!-- Logout Button -->
        <div>
          <q-btn icon="logout" @click="authStore.logout()" flat color="white" />
        </div>
      </q-toolbar>
    </q-header>

    <!-- Main Content Area -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/authStore'
const authStore = useAuthStore()
</script>

<style scoped>
.bg-coffee {
  background-color: #6f4f28; /* สีหลักน้ำตาลกาแฟ */
}

.q-toolbar {
  padding: 10px 20px; /* เพิ่ม padding ให้ดูดี */
}

.q-btn {
  padding: 8px 16px;
}
</style>
