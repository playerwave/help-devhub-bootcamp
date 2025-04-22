<template>
  <q-page padding>
    <h3 class="text-center">Customer Management</h3>

    <q-btn @click="openCreateDialog" label="Add Customer" color="primary" class="q-mb-md" />

    <q-table
      :rows="customers"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :filter="filter"
      :loading="isLoading"
    >
      <template v-slot:top-right>
        <q-input
          v-model="filter"
          debounce="300"
          placeholder="Search"
          class="q-mr-sm"
          outlined
          dense
        />
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-btn
            @click="openEditDialog(props.row)"
            icon="edit"
            color="secondary"
            size="sm"
            flat
            round
            class="q-mr-xs"
          />
          <q-btn
            @click="removeCustomer(props.row.id)"
            icon="delete"
            color="negative"
            size="sm"
            flat
            round
          />
        </q-td>
      </template>
    </q-table>

    <!-- Dialog -->
    <q-dialog v-model="dialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Customer' : 'Add Customer' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="customerForm.name" label="Name" outlined dense />
          <q-input v-model="customerForm.email" label="Email" type="email" outlined dense />
          <q-input v-model="customerForm.phone" label="Phone" type="tel" outlined dense />
        </q-card-section>

        <q-card-actions>
          <q-btn @click="dialogOpen = false" label="Cancel" color="secondary" flat />
          <q-btn
            :label="isEditing ? 'Update' : 'Create'"
            color="primary"
            @click="isEditing ? updateCustomer() : createCustomer()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCustomerStore } from 'src/stores/customerStore'
import { type Customer } from 'src/models'
import { type QTableColumn } from 'quasar'

// Store
const customerStore = useCustomerStore()

// State
const customers = ref<Customer[]>([])
const isLoading = ref(true)
const dialogOpen = ref(false)
const isEditing = ref(false)
type CustomerForm = {
  id?: number
  name: string
  email: string
  phone: string
  points: number
}

const customerForm = ref<CustomerForm>({
  name: '',
  email: '',
  phone: '',
  points: 0,
})
const filter = ref('')
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

// Columns
const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'center' },
  { name: 'name', label: 'Name', field: 'name', align: 'center' },
  { name: 'email', label: 'Email', field: 'email', align: 'center' },
  { name: 'phone', label: 'Phone', field: 'phone', align: 'center' },
  { name: 'points', label: 'Points', field: 'points', align: 'center' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' },
]

// Dialog logic
const openCreateDialog = () => {
  customerForm.value = { name: '', email: '', phone: '', points: 0 }
  isEditing.value = false
  dialogOpen.value = true
}

const openEditDialog = (customer: Customer) => {
  customerForm.value = { ...customer }
  isEditing.value = true
  dialogOpen.value = true
}

// Create
const createCustomer = async () => {
  const newCustomer = { ...customerForm.value } as Customer
  await customerStore.addCustomer(newCustomer)
  dialogOpen.value = false
  fetchCustomers()
}

// Update
const updateCustomer = async () => {
  const updatedCustomer = { ...customerForm.value } as Customer
  if (updatedCustomer.id) {
    await customerStore.updateCustomer(updatedCustomer)
    dialogOpen.value = false
    fetchCustomers()
  }
}

// Delete
const removeCustomer = async (id: number) => {
  await customerStore.deleteCustomer({ id } as Customer)
  fetchCustomers()
}

// Fetch
const fetchCustomers = async () => {
  isLoading.value = true
  customers.value = await customerStore.getCustomers()
  isLoading.value = false
}

// Init
onMounted(fetchCustomers)
</script>

<style scoped>
/* Add your styles here if needed */
</style>
