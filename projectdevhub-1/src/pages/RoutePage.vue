<template>
  <q-page padding>
    {{ route.params }}
    {{ route.hash }}
    {{ route.query }}
    <button @click="router.push({path: '/first-page'})">Goto First Page</button>
  </q-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
</script>
