import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Product } from 'src/models'
import { ref } from 'vue'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])

  async function addProduct(u: Product, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('name', u.name)
      formData.append('price', u.price.toString())
      formData.append('typeId', u.typeId.toString())
      if (file) {
        formData.append('file', file)
      }
      const res = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log(res.data)
      await getProducts()
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
  async function delProduct(u: Product) {
    try {
      Loading.show()
      const res = await api.delete('/products/' + u.id)
      console.log(res.data)
      await getProducts()
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
  async function updateProduct(u: Product, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('name', u.name)
      formData.append('price', u.price.toString())
      formData.append('typeId', u.typeId.toString())
      if (file) {
        formData.append('file', file)
      }

      const res = await api.patch('/products/' + u.id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log(res.data)
      await getProducts()
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

  async function getProducts() {
    try {
      Loading.show()
      const res = await api.get('/products')
      console.log(res.data)
      products.value = res.data
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
  getProducts()
  return { products, addProduct, delProduct, updateProduct, getProducts }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductStore, import.meta.hot))
}
