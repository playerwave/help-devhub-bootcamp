<template>
  <q-card class="my-card">
    <q-img :src="'http://localhost:3000' + product.imageUrl" style="max-height: 300px">
      <div class="absolute-bottom text-center">
        <div class="text-h6">{{ product.name }}</div>
        <div class="text-subtitle2">{{ product.price }}</div>
      </div>
    </q-img>

    <q-card-actions class="q-gutter-sm q-pa-sm">
      <q-btn flat @click="emitSelect">Select</q-btn>
      <q-btn
        v-if="usePoints && product.price <= 80" 
        flat
        color="green"
        @click="emitSelectFree"
      >ฟรี</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { type Product } from 'src/models'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  select: [product: Product]
  selectFree: [product: Product]
}>()

const usePoints = inject('usePoints', false)

function emitSelect() {
  emit('select', props.product)
}

function emitSelectFree() {
  if (props.product.price <= 80) {  // เพิ่มการตรวจสอบราคา
    emit('selectFree', { ...props.product, price: 0 });
  }
}
</script>

<style lang="scss" scoped>
.my-card {
  width: 100%;
  max-width: 100px;
}
</style>
