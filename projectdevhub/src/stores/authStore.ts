// 📁 src/stores/authStore.ts
import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref, watch } from 'vue'
import { type User } from 'src/models'
import { useRouter } from 'vue-router'
import { Loading, Notify, useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useUserStore } from './userStore'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const $q = useQuasar()
  const userStore = useUserStore()
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const currentUser = ref<{
    id: number
    login: string
    email: string
    role: string
    branchId: number
  } | null>(null)

  const isLogin = computed(() => user.value !== null)

  function saveUserToStorage() {
    $q.localStorage.set('user', user.value)
    $q.localStorage.set('token', token.value)
    $q.localStorage.set('currentUser', currentUser.value)
  }

  function loadUserFromStorage() {
    user.value = $q.localStorage.getItem('user')
    token.value = $q.localStorage.getItem('token')
    currentUser.value = $q.localStorage.getItem('currentUser')
  }

  function clearUserFromStorage() {
    $q.localStorage.remove('user')
    $q.localStorage.remove('token')
    $q.localStorage.remove('currentUser')
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      Loading.show()

      const res = await api.post('/auth/login', { login: email, password })
      user.value = res.data.user
      token.value = res.data.access_token

      await userStore.getUsers()
      const foundUser = userStore.users.find((u) => u.login === email)
      if (foundUser) {
        currentUser.value = {
          id: foundUser.id,
          login: foundUser.login,
          email: foundUser.login,
          role: res.data.user.role,
          branchId: res.data.user.branchId,
        }
        console.log(currentUser.value)
      }

      saveUserToStorage()
      return true
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Login failed',
        icon: 'report_problem',
      })
      return false
    } finally {
      Loading.hide()
    }
  }

  async function logout() {
    router.replace({ path: '/login' })
    clearUserFromStorage()
    user.value = null
    token.value = null
    currentUser.value = null
  }

  async function checkIn(userId: number) {
    if (!userId) return
    const timestamp = new Date().toLocaleString()
    console.log(`✅ Auto Check-In: ${userId} at ${timestamp}`)
    await userStore.updateUserStatus(userId, { status: 'Checked In', time: timestamp })
  }

  async function checkOut(userId: number) {
    if (!userId) return
    const timestamp = new Date().toLocaleString()
    console.log(`❌ Auto Check-Out: ${userId} at ${timestamp}`)
    await userStore.updateUserStatus(userId, { status: 'Checked Out', time: timestamp })
  }

  watch(
    () => currentUser.value,
    async (newUser, oldUser) => {
      console.log('🔍 currentUser changed', { newUser, oldUser })

      if (newUser?.id) {
        await checkIn(newUser.id)
      }
      if (!newUser && oldUser?.id) {
        await checkOut(oldUser.id)
      }
    },
    { immediate: true },
  )

  loadUserFromStorage()

  return { login, isLogin, logout, user, token, currentUser }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
