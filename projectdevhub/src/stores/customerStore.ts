import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Customer } from 'src/models' // ต้อง import Customer interface จาก model.ts
import { ref } from 'vue'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])

  const notify = (color: string, message: string, icon: string) => {
    Notify.create({
      color,
      position: 'top',
      message,
      icon,
    })
  }

  async function addCustomer(customer: Customer) {
    try {
      Loading.show()

      // ตรวจสอบค่า email หากเป็นรูปแบบที่ไม่ถูกต้อง
      if (!customer.email.includes('@')) {
        throw new Error('Invalid email address')
      }

      await api.post('/customer', customer)
      await getCustomers()

      notify('positive', 'Customer added successfully', 'check_circle')
    } catch (err) {
      console.error(err)
      notify('negative', 'Add customer failed', 'report_problem')
    } finally {
      Loading.hide()
    }
  }

  async function deleteCustomer(customer: Customer) {
    try {
      Loading.show()
      await api.delete(`/customer/${customer.id}`)
      await getCustomers()

      notify('positive', 'Customer deleted successfully', 'delete')
    } catch (err) {
      console.error(err)
      notify('negative', 'Delete customer failed', 'report_problem')
    } finally {
      Loading.hide()
    }
  }

  async function updateCustomer(customer: Customer) {
    try {
      Loading.show()

      // ตรวจสอบค่า email หากเป็นรูปแบบที่ไม่ถูกต้อง
      if (!customer.email.includes('@')) {
        throw new Error('Invalid email address')
      }

      await api.patch(`/customer/${customer.id}`, customer)
      await getCustomers()

      notify('positive', 'Customer updated successfully', 'update')
    } catch (err) {
      console.error(err)
      notify('negative', 'Update customer failed', 'report_problem')
    } finally {
      Loading.hide()
    }
  }

  async function getCustomers(): Promise<Customer[]> {
    try {
      Loading.show()
      const res = await api.get('/customer')
      customers.value = res.data
      return customers.value // ✅ สำคัญมาก!
    } catch (err) {
      console.error(err)
      notify('negative', 'Loading customers failed', 'report_problem')
      return [] // ✅ fallback return กรณี error
    } finally {
      Loading.hide()
    }
  }

  // เช็คถ้าข้อมูล already loaded
  if (customers.value.length === 0) {
    getCustomers()
  }

  return { customers, addCustomer, deleteCustomer, updateCustomer, getCustomers }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCustomerStore, import.meta.hot))
}
