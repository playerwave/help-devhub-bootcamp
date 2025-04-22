<template>
  <q-card class="my-card">
    <q-img :src="'http://localhost:3000' + product.imageUrl" style="max-height: 300px">
      <div class="absolute-bottom text-center">
        <div class="text-h6">{{ product.name }}</div>
        <div class="text-subtitle2">{{ product.price }}</div>
      </div>
    </q-img>

    <q-card-actions>
      <q-btn flat @click="select">Select</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { type Product } from 'src/models'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  select: [producct: Product]
}>()

function select() {
  emit('select', props.product)
}
</script>

<style lang="scss" scoped>
.my-card {
  width: 100%;
  max-width: 100px;
}
</style>
