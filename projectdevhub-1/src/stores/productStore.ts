import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Product } from 'src/models'
import { ref } from 'vue'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const total = ref(0)
  const searchedProducts = ref<Product[]>([]) // ✅ เก็บผลลัพธ์การค้นหาจาก typeId + price

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
      Loading.hide()
    }
  }

  async function getProductsMoreThan100() {
    try {
      Loading.show()
      const res = await api.get('/products/over-100')
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
      Loading.hide()
    }
  }

  async function addProductByProcedure(u: Product) {
    try {
      Loading.show()
      const res = await api.post('/products/insert-via-procedure', {
        name: u.name,
        price: u.price,
        typeId: u.typeId,
      })
      console.log('Stored Procedure Insert:', res.data)
      await getProducts()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Add via procedure failed',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function getPriceRange(min = 0, max = 999999) {
    try {
      Loading.show()
      const res = await api.get('/products/price-range', {
        params: { min, max },
      })
      products.value = res.data.products
      total.value = res.data.total
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Loading price range failed',
        icon: 'report_problem',
      })
    } finally {
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
      Loading.hide()
    }
  }

  // ✅ เพิ่มใหม่: เรียกสินค้าตาม typeId และ price โดยใช้ stored procedure
  async function getProductsByTypeAndPrice(price: number, typeId: number) {
    try {
      Loading.show()
      const res = await api.get('/products/search', {
        params: { price, typeId },
      })
      console.log('🔎 ค้นหาจากประเภทและราคา:', res.data)
      searchedProducts.value = res.data
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'ค้นหาสินค้าล้มเหลว',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  getProducts()

  return {
    products,
    total,
    searchedProducts, // ✅ export ไปใช้ในหน้า Vue
    addProduct,
    delProduct,
    updateProduct,
    getProducts,
    getProductsMoreThan100,
    getPriceRange,
    addProductByProcedure,
    getProductsByTypeAndPrice, // ✅ export ฟังก์ชันใหม่
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProductStore, import.meta.hot))
}
