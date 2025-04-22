import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Material } from 'src/models'
import { ref } from 'vue'

export const useMaterialStore = defineStore('material', () => {
  const materials = ref<Material[]>([])

  async function addMaterial(material: Material) {
    try {
      Loading.show()

      // ตรวจสอบค่า quantityPerUnit ห้ามติดลบ
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

      // ตรวจสอบค่า quantityPerUnit ห้ามติดลบ
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

      // ตรวจสอบว่า quantityPerUnit มีค่า และตั้งค่าเริ่มต้นเป็น 0 ถ้าไม่มี
      materials.value = res.data.map((mat: Material) => ({
        ...mat,
        quantityPerUnit: mat.quantityPerUnit ?? 0,
      }))
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

  getMaterials() // โหลดข้อมูล materials เมื่อ store ถูกสร้าง

  return { materials, addMaterial, deleteMaterial, updateMaterial, getMaterials }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMaterialStore, import.meta.hot))
}
