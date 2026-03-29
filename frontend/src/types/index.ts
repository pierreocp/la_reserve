// ─────────────────────────────────────────
// Enums (mirror du Prisma schema)
// ─────────────────────────────────────────

export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF'
export type BookingStatus = 'RESERVED' | 'CONFIRMED' | 'ARRIVED' | 'SEATED' | 'DONE' | 'CANCELLED' | 'NO_SHOW' | 'WAITING'
export type BookingPeriod = 'LUNCH' | 'DINNER'
export type TableShape = 'RECTANGLE' | 'SQUARE' | 'CIRCLE'
export type Gender = 'M' | 'F' | 'OTHER'
export type CustomerStatus = 'REGULAR' | 'VIP' | 'BLACKLISTED'

// ─────────────────────────────────────────
// Entities
// ─────────────────────────────────────────

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  restaurantUsers?: RestaurantUser[]
}

export interface Restaurant {
  id: string
  name: string
  address?: string
  city?: string
  zipCode?: string
  phone?: string
  email?: string
  logoUrl?: string
  openingHours?: Record<string, any>
  rooms?: Room[]
  staff?: Staff[]
  createdAt: string
  updatedAt: string
}

export interface RestaurantUser {
  id: string
  role: UserRole
  userId: string
  restaurantId: string
  restaurant?: Pick<Restaurant, 'id' | 'name' | 'logoUrl'>
}

export interface Room {
  id: string
  name: string
  floor: number
  canvasWidth: number
  canvasHeight: number
  isActive: boolean
  restaurantId: string
  tables?: Table[]
}

export interface Table {
  id: string
  name: string
  capacity: number
  minCapacity: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  shape: TableShape
  isCombinable: boolean
  roomId: string
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  vip: boolean
  gender?: Gender
  status: CustomerStatus
  notes?: string
  createdAt: string
  _count?: { bookings: number }
}

export interface Staff {
  id: string
  name: string
  color: string
  restaurantId: string
}

export interface Booking {
  id: string
  date: string
  startTime: string
  endTime: string
  period: BookingPeriod
  pax: number
  status: BookingStatus
  notes?: string
  waitingList: boolean
  confirmationToken?: string
  restaurantId: string
  customerId: string
  staffId?: string
  customer?: Customer
  staff?: Staff
  bookingTables?: BookingTable[]
  createdAt: string
  updatedAt: string
}

export interface BookingTable {
  id: string
  bookingId: string
  tableId: string
  table?: Table
}

export interface ServiceNote {
  id: string
  date: string
  period?: BookingPeriod
  content: string
  restaurantId: string
  createdAt: string
}

// ─────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  RESERVED: 'Réservé',
  CONFIRMED: 'Confirmé',
  ARRIVED: 'Arrivés',
  SEATED: 'Assis',
  DONE: 'Parti',
  CANCELLED: 'Annulé',
  NO_SHOW: 'No-show',
  WAITING: 'Liste d\'attente',
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  RESERVED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  CONFIRMED: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  ARRIVED: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  SEATED: 'bg-green-500/20 text-green-300 border-green-500/30',
  DONE: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
  NO_SHOW: 'bg-red-900/20 text-red-400 border-red-900/30',
  WAITING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
}

export const PERIOD_LABELS: Record<BookingPeriod, string> = {
  LUNCH: 'Midi',
  DINNER: 'Soir',
}
