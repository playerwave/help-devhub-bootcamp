export interface Type {
  id?: number
  name: string
  createAt?: Date
  updateAt?: Date
  deleteAt?: Date
}

export interface Product {
  id?: number
  name: string
  typeId: number
  price: number
  imageUrl?: string
  type?: Type
}

export interface User {
  id: number
  login: string
  password: string
  roles: number[]
  gender: 'male' | 'female'
  age: number
  imageUrl?: string
  file?: File | null
  status?: string
  time?: string
  branchId?: number | null
}

export interface Productcheck {
  id: number
  name: string
  price: number
  image: string
  quantity?: number // ✅ เพิ่มจำนวนสินค้าเพื่อตรวจสอบสต็อก
}

export interface Material {
  id?: number
  name: string
  description?: string
  price: number
  unit: string
  quantityPerUnit?: number // ✅ เพิ่มจำนวนวัสดุต่อหน่วย
  created_at?: Date
  updated_at?: Date // ✅ เพิ่มเวลาอัปเดตล่าสุด
}

export interface MaterialPurchaseHistory {
  id?: number;
  material?: Material; // หรือ materialId: number; ถ้าคุณรับมาแค่ ID
  quantityPurchased: number;
  note?: string;
  createdAt?: Date | string;
}

export interface MaterialUsage {
  id: number
  quantityUsed: number
  usedAt: string
  note?: string
  material?: Material
}

export interface Order {
  id?: number
  userId?: number
  productId: number
  user?: User
  product?: Product
  createAt?: Date
  updateAt?: Date
  deletedAt?: Date | null
}

export interface ReceiptItem {
  id: number
  name: string
  price: number
  total: number
  qty: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  product: Product
}

export interface Receipt {
  id: number
  qty: number
  totalAmount: number
  customer?: Customer
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  items: ReceiptItem[]
}

export interface Payment {
  id?: number
  amount: number
  payDate: string
  payType: 'daily' | 'monthly'
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  userId: number | null
  user?: User | null
}
export interface CreatePaymentDto {
  amount: number
  payDate: string
  payType: 'daily' | 'monthly'
  description?: string
  userId: number
}

export interface PaymentDetail {
  id?: number // เปลี่ยนเป็น optional
  paymentId: number
  userId: number
  amount: number
  date: Date
  method: 'cash' | 'bank_transfer' | 'other'
  createdAt?: Date
  updatedAt?: Date
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  points: number
}

export interface Branch {
  id: number
  name: string
}
