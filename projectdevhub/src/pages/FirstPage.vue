<template>
  <q-page padding>
    <!-- Highlighted Products -->
    <div class="text-h5 q-mb-md">เมนูแนะนำ</div>
    <div class="row q-col-gutter-md">
      <div v-for="item in featured" :key="item.id" class="col-6 col-md-3">
        <q-card class="my-card">
          <q-img :src="item.image" :alt="item.name" ratio="1" />
          <q-card-section>
            <div class="text-subtitle1 text-bold">{{ item.name }}</div>
            <div class="text-caption text-grey">{{ item.description }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Testimonials -->
    <div class="q-mt-xl">
      <div class="text-h5 q-mb-md">รีวิวจากลูกค้า</div>
      <q-carousel swipeable animated v-model="testimonialIndex" navigation arrows infinite>
        <q-carousel-slide
          v-for="review in topReviews"
          :key="review.id"
          :name="review.id"
          class="bg-white text-black flex flex-center column q-pa-md"
        >
          <q-avatar size="56px" class="q-mb-sm" icon="person" />
          <div class="text-body1 text-center">"{{ review.comment }}"</div>
          <div class="text-caption text-grey q-mt-xs">- {{ review.user }}</div>
        </q-carousel-slide>
      </q-carousel>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const featured = ref([
  { id: 1, name: 'Chocolate', image: '/public/chocolate.jpg', description: 'หวาน หอม คาราเมล' },
  { id: 2, name: 'Latte', image: '/public/LATE.jpg', description: 'กาแฟเย็นนุ่มละมุน' },
  { id: 3, name: 'Thai Tea', image: '/public/Thai tea.jpg', description: 'อบสดใหม่ทุกวัน' },
  { id: 4, name: 'Green Tea', image: '/public/Green Tea.jpg', description: 'มัทฉะเข้มข้น เย็นสดชื่น' },
])

const topReviews = ref([
  { id: 1, comment: 'บรรยากาศดี กาแฟอร่อยมาก!', user: 'พิมพ์ใจ' },
  { id: 2, comment: 'ขนมปังโฮมเมดคือที่สุด!', user: 'ณัฐวุฒิ' },
  { id: 3, comment: 'เครื่องดื่มหลากหลาย ราคาน่ารัก', user: 'กมลวรรณ' },
])

const testimonialIndex = ref(1)
</script>

<style scoped>
.my-card {
  background-color: #fff7e6;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.q-page {
  background-color: #fff2d6;
}
</style>
