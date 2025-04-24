import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MaterialUsage } from 'src/models'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'

export const useMaterialUsageStore = defineStore('materialUsage', () => {
  const materialUsageList = ref<MaterialUsage[]>([])
  const allMaterialUsageList = ref<MaterialUsage[]>([])

  async function addUsage(data: {
    materialId: number
    quantityUsed: number
    note?: string
  }) {
    const res = await api.post('/material-usages', data)
    console.log(res.data)

    Notify.create({
      color: 'positive',
      position: 'top',
      message: 'Material usage successfully',
      icon: 'check_circle',
    })
  }

  async function fetchUsageByMaterialId(materialId: number) {
    const res = await api.get(`/material-usages`, {
      params: { materialId },
    })
    materialUsageList.value = res.data
  }

  async function fetchAllUsage() {
    try {
      const res = await api.get('/material-usages')
      allMaterialUsageList.value = res.data
    } catch (err) {
      console.error('Failed to fetch all usages', err)
      Notify.create({
        type: 'negative',
        message: 'โหลดข้อมูลการใช้งานทั้งหมดล้มเหลว',
      })
    }
  }

  return {
    materialUsageList,
    allMaterialUsageList,
    addUsage,
    fetchUsageByMaterialId,
    fetchAllUsage,
  }
})
