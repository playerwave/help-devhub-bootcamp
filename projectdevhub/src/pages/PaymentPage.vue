<template>
  <q-page padding>
    <!-- ปุ่มเปิด Dialog -->
    <q-btn
      label="Add Payment"
      color="primary"
      icon="add"
      class="q-mb-md"
      @click="openPaymentDialog"
    />

    <!-- รายการ Payments -->
    <q-list bordered class="q-mb-md">
      <q-item-label header>Payments</q-item-label>
      <q-item v-for="item in payments" :key="item.id ?? -1">
        <q-item-section>{{ item.amount }}</q-item-section>
        <q-item-section>{{ item.payDate }}</q-item-section>
        <q-item-section>{{ item.payType }}</q-item-section>
        <q-item-section>{{ item.status }}</q-item-section>
        <q-item-section>{{ item.user?.login || 'Unknown Employee' }}</q-item-section>
        <q-item-section>
          <q-btn
            v-if="item.status === 'pending'"
            label="Approve"
            color="green"
            @click="approvePayment(item.id ?? 0)"
          />
          <q-btn
            v-if="item.status === 'pending'"
            label="Reject"
            color="red"
            @click="rejectPayment(item.id ?? 0)"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Dialog สำหรับเพิ่มข้อมูล Payment -->
    <q-dialog v-model="isDialogOpen">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Add Payment Details</div>
          <q-input v-model="payment.amount" label="Amount" type="number" class="q-mt-sm" />
          <q-input v-model="payment.payDate" label="Payment Date" type="date" class="q-mt-sm" />
          <q-select
            v-model="payment.payType"
            :options="['daily', 'monthly']"
            label="Pay Type"
            class="q-mt-sm"
          />
          <q-input v-model="payment.description" label="Description" class="q-mt-sm" />
          <q-select
            v-model="payment.userId"
            :options="employeeOptions"
            label="Select Employee"
            option-value="id"
            option-label="login"
            emit-value
            map-options
            class="q-mt-sm"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="isDialogOpen = false" />
          <q-btn flat label="Submit" color="primary" @click="submitPayment" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePaymentStore } from 'src/stores/paymentStore'
import { useUserStore } from 'src/stores/userStore'

// ✅ type เฉพาะสำหรับการสร้าง payment
type CreatePaymentInput = {
  amount: number
  payDate: string
  payType: 'daily' | 'monthly'
  description: string
  userId: number | null
}

const paymentStore = usePaymentStore()
const userStore = useUserStore()

const isDialogOpen = ref(false)
const payments = ref(paymentStore.getPaymentsByStatus('pending'))

const payment = ref<CreatePaymentInput>({
  amount: 0,
  payDate: '',
  payType: 'daily',
  description: '',
  userId: null,
})

const employeeOptions = ref<Array<{ id: number; login: string }>>([])

onMounted(async () => {
  await userStore.getUsers?.()
  await paymentStore.fetchPaymentsWithUsers()
  updatePaymentsList()

  employeeOptions.value = userStore.users.map((user) => ({
    id: user.id,
    login: user.login,
  }))
})

const updatePaymentsList = () => {
  payments.value = paymentStore.getPaymentsByStatus('pending')
}

const openPaymentDialog = () => {
  payment.value = {
    amount: 0,
    payDate: '',
    payType: 'daily',
    description: '',
    userId: null,
  }
  isDialogOpen.value = true
}

const submitPayment = async () => {
  if (payment.value.userId) {
    await paymentStore.addPayment({
      amount: payment.value.amount,
      payDate: payment.value.payDate,
      payType: payment.value.payType,
      description: payment.value.description ?? '',
      userId: payment.value.userId,
    })
    await paymentStore.fetchPaymentsWithUsers()
    updatePaymentsList()
    isDialogOpen.value = false
  }
}

const approvePayment = async (paymentId: number) => {
  const approvalDetail = await paymentStore.approvePayment(paymentId, 'approved')
  if (approvalDetail) {
    await paymentStore.fetchPaymentsWithUsers()
    updatePaymentsList()
  }
}

const rejectPayment = async (paymentId: number) => {
  const approvalDetail = await paymentStore.approvePayment(paymentId, 'rejected')
  if (approvalDetail) {
    await paymentStore.fetchPaymentsWithUsers()
    updatePaymentsList()
  }
}
</script>

<style scoped>
.q-page {
  max-width: 600px;
  margin: auto;
}
</style>
