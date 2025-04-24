import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Product } from 'src/models'
import { computed, ref } from 'vue'
import { useCustomerStore } from 'src/stores/customerStore';
import type { Receipt } from 'src/models'

// Interface ที่ไม่ใช้งานสามารถลบได้
interface OrderResponse { 
  totalAmount: number;
  qty: number;
  orderItems: OrderItem[];
}

interface ProductItem {
  product: Product
  amount: number
}

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
}

export const usePosStore = defineStore('pos', () => {
  const customerStore = useCustomerStore(); // เรียกใช้ useCustomerStore เพื่อเข้าถึง selectedCustomer
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
    const freeProductId = ref<number | null>(null); // กำหนดค่าเริ่มต้นเป็น null

    // ตรวจสอบว่ามีการเลือกสินค้าฟรี
    const isFreeProduct = freeProductId.value === product.id;

    // ถ้าเป็นสินค้าฟรี ตั้งราคาเป็น 0
    const productToAdd = isFreeProduct ? { ...product, price: 0 } : product;

    // ตรวจสอบว่าสินค้าซ้ำในตะกร้าหรือไม่
    const existingItem = productItems.value.find(item => item.product.id === productToAdd.id)
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

  async function createReceipt(): Promise<Receipt> {
    try {
      const customerName = customerStore.selectedCustomer?.name ?? 'ลูกค้าทั่วไป';
      const customerPhone = customerStore.selectedCustomer?.phone ?? '-';

      const receiptData = {
        totalAmount: sumPrice.value,
        qty: productItems.value.reduce((sum, item) => sum + item.amount, 0),
        customerName: customerName,  // เพิ่มชื่อลูกค้า
        customerPhone: customerPhone, // เพิ่มเบอร์โทรลูกค้า
        items: productItems.value.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          total: item.product.price * item.amount,
          qty: item.amount
        }))
      };
      console.log('Sending Receipt Data:', receiptData);
  
      const response = await api.post('/receipts', receiptData);
      console.log('Receipt Created:', response.data);
  
      productItems.value = [];
  
      return response.data as Receipt; // ✅ return ค่าให้ type ชัดเจน
    } catch (err) {
      console.error('Error creating receipt:', err);
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Failed to create receipt',
        icon: 'report_problem',
      });
      throw err; // ✅ เผื่อให้คนเรียกสามารถจับ error ได้
    }
  }

  async function addOrder(
    customerId: number,
    usePoints: boolean = false,
    freeProductId: number | null = null
  ): Promise<OrderResponse | false> {
    // ตรวจสอบว่ามีสินค้าในตะกร้าหรือไม่
    if (productItems.value.length === 0) {
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'กรุณาเพิ่มสินค้าลงในตะกร้าก่อนทำการสั่งซื้อ',
        icon: 'report_problem',
      });
      return false;
    }
  
    try {
      Loading.show();
      const orderData = {
        customerId: customerId || null,
        usePoints: usePoints,
        freeProductId: freeProductId ?? undefined,
        orderItems: productItems.value.map(item => ({
          productId: item.product.id,
          qty: item.amount
        }))
      };
  
      // ตรวจสอบข้อมูลที่ส่งไป
      console.log("Sending order data: ", orderData);
  
      const res = await api.post('/orders', orderData);
      console.log('Order created:', res.data);
  
      return {
        totalAmount: res.data.totalAmount,
        qty: res.data.qty,
        orderItems: res.data.orderItems
      };
    } catch (err) {
      console.error(err);
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Order creation failed',
        icon: 'report_problem',
      });
      return false;
    } finally {
      Loading.hide();
    }
  }  

  const sumPrice = computed(() => {
    return productItems.value.reduce((sum, item) => sum + item.product.price * item.amount, 0)
  })

  return {
    products,
    getProducts,
    productItems,
    addItem,
    incrementAmount,
    decrementAmount,
    removeItem,
    resetCart,
    sumPrice,
    addOrder,  // เพิ่ม addOrder ที่นี่
    createReceipt
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePosStore, import.meta.hot))
}
