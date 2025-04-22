import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type User } from 'src/models'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])

  async function addUser(u: User, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('login', u.login)
      formData.append('password', u.password)
      formData.append('age', String(u.age))
      formData.append('gender', u.gender)
      u.roles.forEach((roleId) => {
        formData.append('roleIds', String(roleId))
      })

      if (file) {
        formData.append('file', file)
      }

      console.log('Sending data:', formData)

      const res = await api.post('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('Response:', res.data)
      await getUsers()
    } catch (err) {
      console.log('Error:', err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Add failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  async function delUser(u: User) {
    try {
      Loading.show()
      const res = await api.delete('/users/' + u.id)
      console.log(res.data)
      await getUsers()
    } catch (err) {
      console.log(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Delete failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  async function updateUser(u: User, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('login', u.login)
      formData.append('password', u.password)
      formData.append('age', String(u.age))
      formData.append('gender', u.gender)
      u.roles.forEach((roleId) => {
        formData.append('roleIds', String(roleId))
      })
      if (file) {
        formData.append('file', file)
      }
      const res = await api.patch('/users/' + u.id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log(res.data)
      await getUsers()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Update failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  function getUserByEmail(login: string): User | undefined {
    return users.value.find((item) => item.login === login)
  }

  async function getUsers() {
    try {
      Loading.show()
      const res = await api.get('/users')
      console.log(res.data)
      users.value = res.data
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

  function updateUserStatus(userId: number, data: { status: string; time: string }): boolean {
    const user = users.value.find((u) => u.id === userId)
    if (user) {
      user.status = data.status
      user.time = data.time
      return true // ✅ บอกว่าสำเร็จ
    }
    return false // ❌ บอกว่าล้มเหลว
  }

  // ✅ Check-In ฟังก์ชัน
  const checkIn = async (userId: number) => {
    if (!userId) return
    const timestamp = new Date().toLocaleString()
    console.log(`✅ Auto Check-In: ${userId} at ${timestamp}`)

    // ✅ เช็คค่าที่ return จาก updateUserStatus
    if (updateUserStatus(userId, { status: 'Checked In', time: timestamp })) {
      console.log('✅ Check-In สำเร็จ')
    } else {
      console.log('❌ Check-In ล้มเหลว')
    }
  }

  const checkOut = async (userId: number) => {
    if (!userId) return
    const timestamp = new Date().toLocaleString()
    console.log(`❌ Auto Check-Out: ${userId} at ${timestamp}`)

    // ✅ เช็คค่าที่ return จาก updateUserStatus
    if (updateUserStatus(userId, { status: 'Checked Out', time: timestamp })) {
      console.log('✅ Check-Out สำเร็จ')
    } else {
      console.log('❌ Check-Out ล้มเหลว')
    }
  }

  getUsers()

  return {
    users,
    addUser,
    delUser,
    updateUser,
    getUserByEmail,
    getUsers,
    updateUserStatus,
    checkIn,
    checkOut,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
