import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import { useAuthStore } from './authStore'
import type { Payment, PaymentDetail, User } from 'src/models'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    payments: [] as (Payment & { user?: User | null })[], // ข้อมูลการชำระเงิน
    users: [] as User[], // ข้อมูลผู้ใช้
  }),

  actions: {
    // ดึงข้อมูลการชำระเงินและข้อมูลผู้ใช้
    async fetchPaymentsWithUsers() {
      try {
        const [paymentsRes, usersRes] = await Promise.all([api.get('/payments'), api.get('/users')])

        const payments: Payment[] = paymentsRes.data
        const users: User[] = usersRes.data

        console.log('Users data:', users) // ตรวจสอบข้อมูลผู้ใช้ที่ได้
        this.users = users
        this.payments = payments.map((p) => {
          const user = users.find((u) => u.id === p.userId)

          // เพิ่มการเตือนกรณีที่ไม่พบ user
          if (!user) {
            console.warn(`No user found for payment with ID: ${p.id} and userId: ${p.userId}`)
          }

          return {
            ...p,
            user: user ?? null,
          }
        })

        console.log('Payments:', this.payments) // ดูข้อมูลการชำระเงินที่ได้รับ
        console.log('Users:', this.users) // ดูข้อมูลผู้ใช้ที่ได้รับ
      } catch (err) {
        console.error('Error fetching payments and users:', err)
      }
    },

    // ฟังก์ชันเพิ่มการชำระเงินใหม่
    async addPayment(payment: {
      userId: number | null
      amount: number
      payDate: string
      payType: 'daily' | 'monthly'
      description?: string
    }) {
      if (!payment.userId) {
        console.error('User ID is missing or undefined.')
        return // หยุดทำงานหากไม่มี userId
      }

      try {
        const res = await api.post('/payments', payment)
        const newPayment: Payment = res.data

        // ตรวจสอบ userId
        console.log('New Payment User ID:', newPayment.userId)

        const user = this.users.find((u) => u.id === newPayment.userId)
        if (!user) {
          console.error(`User with ID ${newPayment.userId} not found.`)
          return // ออกจากฟังก์ชันหากไม่พบ user
        }

        // เพิ่มการชำระเงินใหม่เข้าใน store
        this.payments.push({
          ...newPayment,
          user: user, // ใช้ user ที่พบจากการค้นหา
        })
      } catch (err) {
        console.error('Error adding payment:', err)
      }
    },

    // ฟังก์ชันอนุมัติหรือลบการชำระเงิน
    async approvePayment(paymentId: number, status: 'approved' | 'rejected') {
      const payment = this.payments.find((p) => p.id === paymentId)
      const currentUserStore = useAuthStore()

      if (payment && payment.id !== undefined) {
        try {
          // อัปเดตสถานะการชำระเงินใน backend
          await api.patch(`/payments/${paymentId}`, {
            status,
            approvedBy: currentUserStore.currentUser?.id ?? 0,
          })

          // อัปเดตสถานะใน frontend
          payment.status = status

          // เพิ่มข้อมูลการอนุมัติ
          const approvalDetail: PaymentDetail = {
            paymentId: payment.id,
            userId: currentUserStore.currentUser?.id ?? 0,
            amount: payment.amount,
            date: new Date(),
            method: 'bank_transfer',
          }

          // รีเฟรชข้อมูลการชำระเงิน
          await this.fetchPaymentsWithUsers()

          return approvalDetail
        } catch (err) {
          console.error('Failed to update payment status:', err)
        }
      }

      return null
    },

    // ฟังก์ชันกรองการชำระเงินตามสถานะ
    getPaymentsByStatus(status: 'pending' | 'approved' | 'rejected') {
      return this.payments.filter((p) => p.status === status)
    },

    // ✅ ดึงข้อมูลการชำระเงินของพนักงาน
    async fetchMyPayments() {
      try {
        const res = await api.get('/payments/my')
        const payments: Payment[] = Array.isArray(res.data) ? res.data : []
        this.payments = payments.map((p) => ({
          ...p,
          user: this.users.find((u) => u.id === p.userId) ?? null,
        }))
      } catch (err) {
        console.error('Failed to fetch my payments:', err)
      }
    },

    // ฟังก์ชันดึงข้อมูลการชำระเงินของสาขา
    async fetchBranchPayments() {
      try {
        const res = await api.get('/payments/branch/payments')
        const payments: Payment[] = Array.isArray(res.data) ? res.data : []
        this.payments = payments.map((p) => ({
          ...p,
          user: this.users.find((u) => u.id === p.userId) ?? null,
        }))
      } catch (err) {
        console.error('Failed to fetch branch payments:', err)
      }
    },
  },
})
