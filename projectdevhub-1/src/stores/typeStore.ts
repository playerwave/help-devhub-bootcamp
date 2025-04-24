import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Type } from 'src/models'
import { ref } from 'vue'

export const useTypeStore = defineStore('type', () => {
  const types = ref<Type[]>([])

  async function addType(u: Type) {
    try {
      Loading.show()
      const res = await api.post('/types', u)
      console.log(res.data)
      await getTypes()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Add failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }
  async function delType(u: Type) {
    try {
      Loading.show()
      const res = await api.delete('/types/' + u.id)
      console.log(res.data)
      await getTypes()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Delete failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }
  async function updateType(u: Type) {
    try {
      Loading.show()
      const res = await api.patch('/types/' + u.id, u)
      console.log(res.data)
      await getTypes()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Update failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  async function getTypes() {
    try {
      Loading.show()
      const res = await api.get('/types')
      console.log(res.data)
      types.value = res.data
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }
  getTypes()
  return { types, addType, delType, updateType, getTypes }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTypeStore, import.meta.hot))
}
