import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Product } from 'src/models'
import { computed, ref } from 'vue'

interface ProductItem {
  product: Product
  amount: number
}

export const usePosStore = defineStore('pos', () => {
  const products = ref<Product[]>([])
  const productItems = ref<ProductItem[]>([])

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

  function addItem(product: Product) {
    const existingItem = productItems.value.find(item => item.product.id === product.id)
    if (existingItem) {
      existingItem.amount++
    } else {
      productItems.value.push({ product, amount: 1 })
    }
  }

  function incrementAmount(item: ProductItem) {
    item.amount++
  }

  function decrementAmount(item: ProductItem) {
    if (item.amount > 1) {
      item.amount--
    } else {
      removeItem(item)
    }
  }

  function removeItem(item: ProductItem) {
    productItems.value = productItems.value.filter(i => i !== item)
  }

  function resetCart() {
    productItems.value = []
  }

  // ฟังก์ชันการสร้างใบเสร็จ
  async function createReceipt() {
    try {
      // เตรียมข้อมูลที่จำเป็นสำหรับการสร้างใบเสร็จ
      const receiptData = {
        totalAmount: sumPrice.value,  // ใช้ sumPrice ที่คำนวณจาก productItems
        qty: productItems.value.reduce((sum, item) => sum + item.amount, 0),
        items: productItems.value.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          total: item.product.price * item.amount,
          qty: item.amount
        }))
      };

      // ส่งข้อมูลไปที่ backend เพื่อสร้างใบเสร็จ
      const response = await api.post('/receipts', receiptData);
      console.log('Receipt Created:', response.data);

      // รีเซ็ตตะกร้าสินค้าหลังจากสร้างใบเสร็จ
      productItems.value = [];
    } catch (err) {
      console.error('Error creating receipt:', err);
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Failed to create receipt',
        icon: 'report_problem',
      });
    }
  }

  async function addOrder(): Promise<boolean> {
    try {
      Loading.show()
      const res = await api.post('/orders', {
        userId: 1,
        orderItems: productItems.value.map(item => ({
          productId: item.product.id,
          qty: item.amount
        }))
      })
      console.log('Order created:', res.data)
      Notify.create({
        color: 'positive',
        position: 'top',
        message: 'Order created successfully!',
        icon: 'check_circle',
      })
      return true
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Order creation failed',
        icon: 'report_problem',
      })
      return false
    } finally {
      Loading.hide()
    }
  }  

  const sumPrice = computed(() => {
    return productItems.value.reduce((sum, item) => sum + item.product.price * item.amount, 0)
  })

  return { products, getProducts, productItems, addItem, incrementAmount, decrementAmount, removeItem, resetCart, sumPrice, addOrder, createReceipt }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePosStore, import.meta.hot))
}
