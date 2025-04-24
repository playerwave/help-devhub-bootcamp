// src/stores/branchStore.ts
import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import type { Branch } from 'src/models'

export const useBranchStore = defineStore('branch', {
  state: () => ({
    branches: [] as Branch[],
  }),
  actions: {
    async getBranches() {
      try {
        const res = await api.get('/branches') // สมมุติว่ามี endpoint สำหรับดึงสาขาทั้งหมด
        this.branches = res.data
      } catch (err) {
        console.error('Error fetching branches:', err)
      }
    },
  },
})
