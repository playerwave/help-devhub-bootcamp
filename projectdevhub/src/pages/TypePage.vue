<template>
  <h3 class="q-my-md text-center text-blue">Type List</h3>
  <q-page padding>
    <div class="row justify-end"><q-btn icon="add" flat @click="dialog = true"></q-btn></div>
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 350px">
        <div class="text-h6">{{ id === 0 ? 'Add New Type' : 'Edit Type' }}</div>

        <q-card-section class="q-pt-none">
          <q-form ref="form" @submit="onSubmit" @reset="onReset" class="q-gutter-md">
            <q-input
              filled
              v-model="name"
              label="Name"
              hint="Name Type"
              lazy-rules
              :rules="[(val) => (val && val.length > 0) || 'Please enter name type']"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="reset" />
          <q-btn flat label="Submit" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-table :columns="columns" :rows="typeStore.types">
      <template v-slot:body-cell-operation="{ row }">
        <q-btn flat icon="edit" @click="edit(row)"></q-btn>
        <q-btn flat icon="delete" @click="remove(row)"></q-btn
      ></template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import type { Type } from 'src/models'
import { ref } from 'vue'
import { type QForm, type QTableColumn } from 'quasar'
import { useTypeStore } from 'src/stores/typeStore'
const dialog = ref(false)
const form = ref<QForm | null>(null)
const columns: QTableColumn[] = [
  {
    name: 'id',
    field: 'id',
    label: 'ID',
    align: 'center',
    sortable: true,
  },
  {
    name: 'name',
    field: 'name',
    label: 'Name',
    align: 'center',
  },
  {
    name: 'operation',
    field: 'operation',
    label: '',
    align: 'center',
  },
]

const typeStore = useTypeStore()
const id = ref(0)
const name = ref('')

function edit(row: Type) {
  id.value = row.id ?? 0
  name.value = row.name
  dialog.value = true
}

function onSubmit() {
  if (id.value === 0) {
    typeStore.addType({
      id: id.value,
      name: name.value,
    })
  } else {
    typeStore.updateType({
      id: id.value,
      name: name.value,
    })
  }
  dialog.value = false
  onReset()
}

function save() {
  form.value?.validate().then((success) => {
    if (success) {
      if (id.value === 0) {
        typeStore.addType({
          name: name.value,
        })
      } else {
        typeStore.updateType({
          id: id.value,
          name: name.value,
        })
      }
      dialog.value = false
      onReset()
    }
  })
}

function reset() {
  form.value?.resetValidation()
  id.value = 0
  name.value = ''
  dialog.value = false
}

function onReset() {
  id.value = 0
  name.value = ''
  dialog.value = false
}

function remove(row: Type) {
  typeStore.delType(row)
}
</script>
