import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Material, type MaterialPurchaseHistory } from 'src/models' // ✅ Import MaterialPurchaseHistory type
import { ref } from 'vue'

export const useMaterialStore = defineStore('material', () => {
  const materials = ref<Material[]>([])
  const allPurchaseHistory = ref<MaterialPurchaseHistory[]>([]) // ✅ State สำหรับเก็บประวัติการสั่งซื้อทั้งหมด
  const materialPurchaseHistoryList = ref<MaterialPurchaseHistory[]>([]) // ✅ State สำหรับเก็บประวัติการสั่งซื้อเฉพาะวัสดุ

  async function addMaterial(material: Material) {
    try {
      Loading.show()

      if (material.quantityPerUnit !== undefined && material.quantityPerUnit < 0) {
        throw new Error('Quantity per Unit cannot be negative')
      }

      const res = await api.post('/materials', material)
      console.log(res.data)
      await getMaterials()

      Notify.create({
        color: 'positive',
        position: 'top',
        message: 'Material added successfully',
        icon: 'check_circle',
      })
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Add material failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function deleteMaterial(material: Material) {
    try {
      Loading.show()
      const res = await api.delete(`/materials/${material.id}`)
      console.log(res.data)
      await getMaterials()

      Notify.create({
        color: 'positive',
        position: 'top',
        message: 'Material deleted successfully',
        icon: 'delete',
      })
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Delete material failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function updateMaterial(material: Material) {
    try {
      Loading.show()

      if (material.quantityPerUnit !== undefined && material.quantityPerUnit < 0) {
        throw new Error('Quantity per Unit cannot be negative')
      }

      const res = await api.patch(`/materials/${material.id}`, material)
      console.log(res.data)
      await getMaterials()

      Notify.create({
        color: 'positive',
        position: 'top',
        message: 'Material updated successfully',
        icon: 'update',
      })
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Update material failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function getMaterials() {
    try {
      Loading.show()
      const res = await api.get('/materials')
      console.log(res.data)

      materials.value = res.data.map((mat: Material) => ({
        ...mat,
        quantityPerUnit: mat.quantityPerUnit ?? 0,
      }))
      // //ตรวจสอบว่าเหลือวัสดุไหนน้อยกว่า 3 และแจ้งเตือน
      // materials.value.forEach((material) => {
      //   //ตรวจสอบว่า quantityPerUnit มีค่าเป็นตัวเลขและไม่ใช่ undefined
      //   if (material.quantityPerUnit !== undefined && material.quantityPerUnit < 4) {
      //     Notify.create({
      //       color: 'negative',
      //       position: 'top',
      //       message: `วัสดุ ${material.name} ใกล้หมด!`,
      //       icon: 'warning',
      //     })
      //   }
      // })
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Loading materials failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function purchaseMaterial(materialId: number, quantity: number, note?: string) {
    try {
      await api.post('/material-purchases', {
        materialId,
        quantity,
        note,
      })
    } catch (err) {
      console.error('Failed to record purchase', err)
      Notify.create({
        type: 'negative',
        message: 'บันทึกการซื้อวัตถุดิบล้มเหลว',
      })
    }
  }

  async function fetchAllPurchaseHistory() {
    try {
      const res = await api.get('/material-purchases')
      allPurchaseHistory.value = res.data
    } catch (err) {
      console.error('Failed to fetch all purchase history', err)
      Notify.create({
        type: 'negative',
        message: 'โหลดประวัติการสั่งซื้อทั้งหมดล้มเหลว',
      })
    }
  }

  async function fetchPurchaseHistoryByMaterialId(materialId: number) {
    try {
      const res = await api.get(`/material-purchases?materialId=${materialId}`)
      materialPurchaseHistoryList.value = res.data
    } catch (err) {
      console.error(`Failed to fetch purchase history for material ID ${materialId}`, err)
      Notify.create({
        type: 'negative',
        message: `โหลดประวัติการสั่งซื้อสำหรับวัสดุ ID ${materialId} ล้มเหลว`,
      })
    }
  }

  getMaterials()
  fetchAllPurchaseHistory() // ✅ โหลดประวัติการสั่งซื้อทั้งหมดเมื่อ Store ถูกสร้าง

  return {
    materials,
    allPurchaseHistory, // ✅ Export state
    materialPurchaseHistoryList, // ✅ Export state
    addMaterial,
    deleteMaterial,
    updateMaterial,
    getMaterials,
    purchaseMaterial,
    fetchAllPurchaseHistory, // ✅ Export action
    fetchPurchaseHistoryByMaterialId, // ✅ Export action
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMaterialStore, import.meta.hot))
}
