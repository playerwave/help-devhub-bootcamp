<template>
  <q-page padding class="q-pa-md">
    <div style="max-width: 400px" class="fixed-center">
      {{ authStore.isLogin }}
      <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
        <q-input
          filled
          v-model="email"
          label="Your email *"
          hint="Email"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <q-input
          filled
          type="password"
          v-model="password"
          label="Your password *"
          lazy-rules
          :rules="[(val) => (val !== null && val !== '') || 'Please type your password']"
        />

        <div>
          <q-btn label="Submit" type="submit" color="primary" />
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
      <q-list>
        <q-item v-for="u in userStore.users" :key="u.id"> {{ u.login }} {{ u.password }}</q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { useUserStore } from 'src/stores/userStore'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const $q = useQuasar()
const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
async function onSubmit() {
  if (await authStore.login(email.value, password.value)) {
    await userStore.getUsers()
    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Submitted',
    })
    const redirectTo = route.query.redirect || '/'
    router.replace(redirectTo.toString())
  } else {
    $q.notify({
      color: 'red-4',
      textColor: 'white',
      icon: 'error',
      message: 'Error',
    })
  }
}

function onReset() {
  email.value = ''
  password.value = ''
}
</script>
