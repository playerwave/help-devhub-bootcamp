import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { useAuthStore } from './authStore'
import type { Payment, PaymentDetail, User } from 'src/models'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    payments: [] as (Payment & { user?: User | null })[],
    users: [] as User[], // เก็บ user ไว้ใน store เพื่อหา user ชื่อ
  }),

  actions: {
    // ✅ ดึงข้อมูล payments พร้อม users
    async fetchPaymentsWithUsers() {
      try {
        const [paymentsRes, usersRes] = await Promise.all([api.get('/payments'), api.get('/users')])

        const payments: Payment[] = paymentsRes.data
        const users: User[] = usersRes.data

        this.users = users
        this.payments = payments.map((p) => ({
          ...p,
          user: users.find((u) => u.id === p.userId) ?? null,
        }))
      } catch (err) {
        console.error('Error fetching payments and users:', err)
      }
    },

    // ✅ เพิ่ม payment ใหม่ (CreatePaymentDto)
    async addPayment(payment: {
      userId: number | null
      amount: number
      payDate: string
      payType: 'daily' | 'monthly'
      description?: string
    }) {
      try {
        const res = await api.post('/payments', payment)
        const newPayment: Payment = res.data

        this.payments.push({
          ...newPayment,
          user: this.users.find((u) => u.id === newPayment.userId) ?? null,
        })
      } catch (err) {
        console.error('Error adding payment:', err)
      }
    },

    // ✅ อนุมัติ / ปฏิเสธ payment
    async approvePayment(paymentId: number, status: 'approved' | 'rejected') {
      const payment = this.payments.find((p) => p.id === paymentId)
      const currentUserStore = useAuthStore()

      if (payment && payment.id !== undefined) {
        try {
          await api.patch(`/payments/${paymentId}`, {
            status,
            approvedBy: currentUserStore.currentUser?.id ?? 0,
          })

          payment.status = status

          const approvalDetail: PaymentDetail = {
            paymentId: payment.id,
            userId: currentUserStore.currentUser?.id ?? 0,
            amount: payment.amount,
            date: new Date(),
            method: 'bank_transfer',
          }

          await this.fetchPaymentsWithUsers()

          return approvalDetail
        } catch (err) {
          console.error('Failed to update payment status:', err)
        }
      }

      return null
    },

    // ✅ Filter payment ตามสถานะ
    getPaymentsByStatus(status: 'pending' | 'approved' | 'rejected') {
      return this.payments.filter((p) => p.status === status)
    },
  },
})
