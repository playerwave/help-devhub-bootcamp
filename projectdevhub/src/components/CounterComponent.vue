<template>
  <div>{{ props.num }}</div>
  <div>{{ data }}</div>
  <div><button @click="dec">-</button><button @click="inc">+</button></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
  num: number
}>() 
const emit = defineEmits<{
  update: [num: number]
}>()

onMounted(() => {
  data.value = props.num
})

const data = ref(2)
const inc = function() {
  data.value++
  emit('update', data.value)
}
const dec = () => {
  data.value--
  emit('update', data.value)
}
</script>
