export type Slot = 'morning' | 'afternoon' | 'fullday'

export interface DayBookings {
    morning?: { name?: string }
    afternoon?: { name?: string }
    fullday?: { name?: string }
}

export type MonthMap = Record<string, DayBookings> // key: YYYY-MM-DD